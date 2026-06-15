<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\ClinicalProtocol;
use App\Models\GroupClass;
use App\Models\Membership;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with('patients')
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time');

        if ($request->filled('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('patients', function ($sub) use ($request) {
                    $sub->where('name', 'ilike', '%'.$request->search.'%');
                })->orWhere('title', 'ilike', '%'.$request->search.'%');
            });
        }

        $appointments = $query->paginate(15)->withQueryString();

        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $groupClasses = GroupClass::orderBy('name')->get(['id', 'name', 'color', 'max_participants']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'filters' => $request->only(['date_from', 'date_to', 'search']),
            'patients' => $patients,
            'groupClasses' => $groupClasses,
            'users' => $users,
        ]);
    }

    public function create(Request $request)
    {
        return redirect()->route('appointments.index', [
            'create' => 'true',
            'patient_id' => $request->query('patient_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'uuid|exists:patients,id',
            'type' => 'required|in:individual,group',
            'group_class_id' => 'nullable|required_if:type,group|uuid|exists:group_classes,id',
            'title' => 'nullable|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'duration_minutes' => 'required|integer|min:10|max:180',
            'notes' => 'nullable|string|max:1000',
            'is_recurring' => 'nullable|boolean',
            'recurrence_end_date' => 'nullable|required_if:is_recurring,true|date|after_or_equal:appointment_date',
        ]);

        if (count($validated['patient_ids']) > $validated['max_participants']) {
            return back()->withErrors(['patient_ids' => 'O número de alunos excede a capacidade máxima da turma.'])->withInput();
        }

        // Validate memberships
        $invalidPatients = [];
        $exhaustedPatients = [];
        foreach ($validated['patient_ids'] as $patientId) {
            $patient = Patient::find($patientId);
            $activeMembership = Membership::where('patient_id', $patientId)
                ->where('status', 'active')
                ->where('end_date', '>=', now()->startOfDay())
                ->whereHas('commercialPlan', function ($q) {
                    $q->whereIn('category', ['pilates', 'teste']);
                })
                ->with('commercialPlan')
                ->first();

            if (! $activeMembership && $validated['type'] === 'group') {
                $invalidPatients[] = $patient->name;
            } elseif ($activeMembership && $activeMembership->sessions_remaining === 0) {
                $exhaustedPatients[] = $patient->name;
            }
        }

        if (count($invalidPatients) > 0) {
            $names = implode(', ', $invalidPatients);

            return back()->withErrors(['patient_ids' => "Os seguintes pacientes não possuem um plano ativo de Pilates ou Aula Teste: $names."])->withInput();
        }

        $userId = $request->user_id ?? auth()->id();
        $isRecurring = $request->boolean('is_recurring');
        $endDate = $isRecurring ? Carbon::parse($validated['recurrence_end_date']) : Carbon::parse($validated['appointment_date']);
        $currentDate = Carbon::parse($validated['appointment_date']);

        $createdCount = 0;
        $conflictCount = 0;

        DB::beginTransaction();
        try {
            while ($currentDate->lessThanOrEqualTo($endDate)) {
                $dateString = $currentDate->format('Y-m-d');

                // Check for schedule conflict (same user_id overlapping times)
                $conflict = Appointment::where('appointment_date', $dateString)
                    ->where('user_id', $userId)
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($validated) {
                        $start = $validated['start_time'];
                        $end = date('H:i', strtotime($start) + ($validated['duration_minutes'] * 60));
                        $query->where(function ($q) use ($start, $end) {
                            $q->where('start_time', '<', $end)
                                ->whereRaw("start_time::time + (duration_minutes || ' minutes')::interval > ?::time", [$start]);
                        });
                    })->exists();

                // Guard against duplicates (e.g. re-submitting a recurring
                // series): the same patient already booked at that date/time.
                $patientAlreadyBooked = Appointment::where('appointment_date', $dateString)
                    ->where('start_time', $validated['start_time'])
                    ->where('status', '!=', 'cancelled')
                    ->whereHas('patients', function ($q) use ($validated) {
                        $q->whereIn('patients.id', $validated['patient_ids']);
                    })->exists();

                $conflict = $conflict || $patientAlreadyBooked;

                if ($conflict) {
                    if ($createdCount === 0 && ! $isRecurring) {
                        DB::rollBack();

                        return back()->withErrors(['start_time' => 'Já existe um agendamento neste horário.'])->withInput();
                    }
                    $conflictCount++;
                } else {
                    $appointment = Appointment::create([
                        'title' => $validated['title'],
                        'type' => $validated['type'],
                        'group_class_id' => $validated['group_class_id'] ?? null,
                        'max_participants' => $validated['max_participants'],
                        'appointment_date' => $dateString,
                        'start_time' => $validated['start_time'],
                        'duration_minutes' => $validated['duration_minutes'],
                        'notes' => $validated['notes'],
                        'user_id' => $userId,
                    ]);

                    foreach ($validated['patient_ids'] as $patientId) {
                        $appointment->patients()->attach($patientId, ['status' => 'scheduled']);
                    }

                    $createdCount++;
                }

                $currentDate->addWeek();
                if (! $isRecurring) {
                    break;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $message = 'Agendamento criado com sucesso!';
        if ($isRecurring) {
            $message = "Foram criados $createdCount agendamentos.";
            if ($conflictCount > 0) {
                $message .= " Atenção: $conflictCount agendamento(s) ignorados devido a conflito de horário.";
            }
        }

        $redirect = redirect()->route('appointments.index')->with('success', $message);

        if (count($exhaustedPatients) > 0) {
            $names = implode(', ', $exhaustedPatients);
            $redirect->with('warning', "⚠️ Sem sessões restantes no plano: $names. A sessão foi agendada mesmo assim.");
        }

        return $redirect;
    }

    public function events(Request $request)
    {
        $query = Appointment::with(['patients', 'groupClass']);

        if ($request->filled('start')) {
            $query->where('appointment_date', '>=', substr($request->start, 0, 10));
        }

        if ($request->filled('end')) {
            $query->where('appointment_date', '<', substr($request->end, 0, 10));
        }

        $appointments = $query->get();

        $events = $appointments->map(function ($app) {
            $start_datetime = $app->appointment_date->format('Y-m-d').'T'.$app->start_time;
            $end_datetime = date('Y-m-d\TH:i:s', strtotime($start_datetime) + ($app->duration_minutes * 60));

            // Use the group class color if available, otherwise default purple for group / blue for individual
            if ($app->type === 'group' && $app->groupClass) {
                $bgColor = $app->groupClass->color ?: '#8b5cf6';
            } else {
                $bgColor = $app->type === 'group' ? '#8b5cf6' : '#3b82f6';
            }

            $title = $app->title;
            if (! $title && $app->patients->count() > 0) {
                $title = $app->patients->first()->name;
                if ($app->patients->count() > 1) {
                    $title .= ' + '.($app->patients->count() - 1);
                }
            }

            return [
                'id' => $app->id,
                'title' => $title ?: 'Agendamento',
                'start' => $start_datetime,
                'end' => $end_datetime,
                'backgroundColor' => $bgColor,
                'borderColor' => 'transparent',
                'extendedProps' => [
                    'type' => $app->type,
                    'status' => $app->status,
                    'patient_count' => $app->patients->count(),
                    'max_participants' => $app->max_participants,
                ],
            ];
        });

        return response()->json($events);
    }

    public function details(Appointment $appointment)
    {
        $appointment->load('patients');

        return response()->json($appointment);
    }

    public function reschedule(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'update_mode' => 'nullable|in:single,future',
        ]);

        $updateMode = $validated['update_mode'] ?? 'single';

        if ($updateMode === 'future' && $appointment->type === 'group' && $appointment->group_class_id) {
            DB::beginTransaction();
            try {
                $oldDate = $appointment->appointment_date;
                $oldTime = $appointment->start_time;
                $oldDayOfWeek = Carbon::parse($oldDate)->dayOfWeek; // 0 (Sun) - 6 (Sat)

                $newDateObj = Carbon::parse($validated['appointment_date']);
                $newDayOfWeek = $newDateObj->dayOfWeek;
                $newTime = $validated['start_time'];

                // Shifting future appointments
                $futureAppointments = Appointment::where('group_class_id', $appointment->group_class_id)
                    ->where('appointment_date', '>=', $oldDate->format('Y-m-d'))
                    ->where('start_time', $oldTime)
                    ->get()
                    ->filter(function ($appt) use ($oldDayOfWeek) {
                        return Carbon::parse($appt->appointment_date)->dayOfWeek === $oldDayOfWeek;
                    });

                $daysDiff = Carbon::parse($oldDate)->startOfDay()->diffInDays($newDateObj->startOfDay(), false);

                foreach ($futureAppointments as $appt) {
                    $shiftedDate = Carbon::parse($appt->appointment_date)->addDays($daysDiff);
                    $appt->update([
                        'appointment_date' => $shiftedDate->format('Y-m-d'),
                        'start_time' => $newTime,
                    ]);
                }

                // Update the base schedule
                $groupClass = GroupClass::find($appointment->group_class_id);
                if ($groupClass) {
                    // Start times are often stored as H:i:s, $oldTime might be H:i
                    $schedule = $groupClass->schedules()
                        ->where('day_of_week', $oldDayOfWeek)
                        ->where(function ($q) use ($oldTime) {
                            $q->where('start_time', $oldTime)
                                ->orWhere('start_time', $oldTime.':00');
                        })->first();

                    if ($schedule) {
                        $schedule->update([
                            'day_of_week' => $newDayOfWeek,
                            'start_time' => $newTime,
                        ]);
                    }
                }

                DB::commit();

                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        }

        // Default single update
        $appointment->update([
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
        ]);

        return response()->json(['success' => true]);
    }

    public function show(Appointment $appointment)
    {
        $appointment->load('patients');
        $protocols = ClinicalProtocol::orderBy('name')->get(['id', 'name']);
        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        $groupClasses = GroupClass::orderBy('name')->get(['id', 'name', 'color', 'max_participants']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
            'protocols' => $protocols,
            'patients' => $patients,
            'users' => $users,
            'groupClasses' => $groupClasses,
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $appointment->load('patients');
        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
            'patients' => $patients,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'uuid|exists:patients,id',
            'type' => 'required|in:individual,group',
            'group_class_id' => 'nullable|required_if:type,group|uuid|exists:group_classes,id',
            'title' => 'nullable|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'duration_minutes' => 'required|integer|min:10|max:180',
            'notes' => 'nullable|string|max:1000',
        ]);

        if (count($validated['patient_ids']) > $validated['max_participants']) {
            return back()->withErrors(['patient_ids' => 'O número de alunos excede a capacidade máxima da turma.'])->withInput();
        }

        // Validate memberships
        $invalidPatients = [];
        foreach ($validated['patient_ids'] as $patientId) {
            $patient = Patient::find($patientId);
            $hasActivePlan = Membership::where('patient_id', $patientId)
                ->where('status', 'active')
                ->where('end_date', '>=', now()->startOfDay())
                ->whereHas('commercialPlan', function ($q) {
                    $q->whereIn('category', ['pilates', 'teste']);
                })->exists();

            if (! $hasActivePlan && $validated['type'] === 'group') {
                $invalidPatients[] = $patient->name;
            }
        }

        if (count($invalidPatients) > 0) {
            $names = implode(', ', $invalidPatients);

            return back()->withErrors(['patient_ids' => "Os seguintes pacientes não possuem um plano ativo de Pilates ou Aula Teste: $names."])->withInput();
        }

        $userId = $request->user_id ?? auth()->id();

        // Check for schedule conflict
        $conflict = Appointment::where('appointment_date', $validated['appointment_date'])
            ->where('id', '!=', $appointment->id)
            ->where('user_id', $userId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                $start = $validated['start_time'];
                $end = date('H:i', strtotime($start) + ($validated['duration_minutes'] * 60));
                $query->where(function ($q) use ($start, $end) {
                    $q->where('start_time', '<', $end)
                        ->whereRaw("start_time::time + (duration_minutes || ' minutes')::interval > ?::time", [$start]);
                });
            })->exists();

        if ($conflict) {
            return back()->withErrors(['start_time' => 'Já existe um agendamento neste horário.'])->withInput();
        }

        DB::beginTransaction();
        try {
            $appointment->update([
                'title' => $validated['title'],
                'type' => $validated['type'],
                'group_class_id' => $validated['group_class_id'] ?? null,
                'max_participants' => $validated['max_participants'],
                'appointment_date' => $validated['appointment_date'],
                'start_time' => $validated['start_time'],
                'duration_minutes' => $validated['duration_minutes'],
                'notes' => $validated['notes'],
                'user_id' => $userId,
            ]);

            // Sync patients. Keep status of existing ones, set 'scheduled' for new ones.
            $existingPivots = $appointment->patients()->pluck('status', 'patient_id')->toArray();
            $syncData = [];
            foreach ($validated['patient_ids'] as $pId) {
                $syncData[$pId] = ['status' => $existingPivots[$pId] ?? 'scheduled'];
            }
            $appointment->patients()->sync($syncData);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Agendamento atualizado!');
    }

    public function updateStatus(Request $request, Appointment $appointment, $patientId)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,attended,missed,cancelled',
        ]);

        if (! $appointment->patients()->whereKey($patientId)->exists()) {
            return back()->withErrors(['status' => 'Paciente não pertence a este agendamento.']);
        }

        $appointment->patients()->updateExistingPivot($patientId, [
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Status atualizado com sucesso.');
    }

    /**
     * Update the session-level status (scheduled | completed | cancelled) and
     * cascade a sensible per-patient attendance change.
     */
    public function updateAppointmentStatus(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        DB::transaction(function () use ($appointment, $validated) {
            $appointment->update(['status' => $validated['status']]);

            // Patients still "scheduled" inherit the session outcome; explicit
            // attended/missed/cancelled marks set per patient are preserved.
            if ($validated['status'] === 'completed') {
                $appointment->patients()->wherePivot('status', 'scheduled')
                    ->each(fn ($patient) => $appointment->patients()->updateExistingPivot($patient->id, ['status' => 'attended']));
            } elseif ($validated['status'] === 'cancelled') {
                $appointment->patients()->wherePivot('status', 'scheduled')
                    ->each(fn ($patient) => $appointment->patients()->updateExistingPivot($patient->id, ['status' => 'cancelled']));
            }
        });

        return back()->with('success', 'Status da sessão atualizado.');
    }

    public function destroy(Request $request, Appointment $appointment)
    {
        $deleteMode = $request->query('delete_mode', 'single');

        if ($deleteMode === 'future') {
            // Delete this and all future scheduled appointments
            $query = Appointment::where('appointment_date', '>=', $appointment->appointment_date)
                ->where('status', 'scheduled');

            if ($appointment->group_class_id) {
                // For group classes: delete all future of the same group class
                $query->where('group_class_id', $appointment->group_class_id);
            } else {
                // No group class link (individual sessions OR orphaned group
                // appointments left over from a deleted class): match the same
                // type, start_time and overlapping patients on the same weekday.
                $patientIds = $appointment->patients()->pluck('patients.id')->toArray();
                $query->where('type', $appointment->type)
                    ->where('start_time', $appointment->start_time)
                    ->whereHas('patients', function ($q) use ($patientIds) {
                        $q->whereIn('patients.id', $patientIds);
                    });
            }

            $toDelete = $query->get();

            // Filter by day of week for individual appointments to be safe
            if (! $appointment->group_class_id) {
                $dayOfWeek = Carbon::parse($appointment->appointment_date)->dayOfWeek;
                $toDelete = $toDelete->filter(function ($app) use ($dayOfWeek) {
                    return Carbon::parse($app->appointment_date)->dayOfWeek === $dayOfWeek;
                });
            }
            $count = $toDelete->count();

            foreach ($toDelete as $app) {
                $app->patients()->detach();
                $app->delete();
            }

            return redirect()->route('appointments.index')
                ->with('success', "✅ {$count} agendamentos excluídos!");
        }

        // Single delete
        $appointment->patients()->detach();
        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Agendamento excluído!');
    }
}
