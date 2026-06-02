<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Membership;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
            $query->whereHas('patients', function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%');
            })->orWhere('title', 'ilike', '%' . $request->search . '%');
        }

        $appointments = $query->paginate(15)->withQueryString();

        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'filters' => $request->only(['date_from', 'date_to', 'search']),
            'patients' => $patients,
        ]);
    }

    public function create(Request $request)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/create', [
            'patients' => $patients,
            'selectedPatientId' => $request->query('patient_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'uuid|exists:patients,id',
            'type' => 'required|in:individual,group',
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
        foreach ($validated['patient_ids'] as $patientId) {
            $patient = Patient::find($patientId);
            $hasActivePlan = Membership::where('patient_id', $patientId)
                ->where('status', 'active')
                ->where('end_date', '>=', now()->startOfDay())
                ->whereHas('commercialPlan', function ($q) {
                    $q->whereIn('category', ['pilates', 'teste']);
                })->exists();

            if (!$hasActivePlan && $validated['type'] === 'group') {
                $invalidPatients[] = $patient->name;
            }
        }

        if (count($invalidPatients) > 0) {
            $names = implode(', ', $invalidPatients);
            return back()->withErrors(['patient_ids' => "Os seguintes pacientes não possuem um plano ativo de Pilates ou Aula Teste: $names."])->withInput();
        }

        $userId = auth()->id();
        $isRecurring = $request->boolean('is_recurring');
        $endDate = $isRecurring ? \Carbon\Carbon::parse($validated['recurrence_end_date']) : \Carbon\Carbon::parse($validated['appointment_date']);
        $currentDate = \Carbon\Carbon::parse($validated['appointment_date']);
        
        $createdCount = 0;
        $conflictCount = 0;

        DB::beginTransaction();
        try {
            while ($currentDate->lessThanOrEqualTo($endDate)) {
                $dateString = $currentDate->format('Y-m-d');

                // Check for schedule conflict (same user_id overlapping times)
                $conflict = Appointment::where('appointment_date', $dateString)
                    ->where('user_id', $userId)
                    ->where(function ($query) use ($validated) {
                        $start = $validated['start_time'];
                        $end = date('H:i', strtotime($start) + ($validated['duration_minutes'] * 60));
                        $query->where(function ($q) use ($start, $end) {
                            $q->where('start_time', '<', $end)
                              ->whereRaw("start_time::time + (duration_minutes || ' minutes')::interval > ?::time", [$start]);
                        });
                    })->exists();

                if ($conflict) {
                    if ($createdCount === 0 && !$isRecurring) {
                        DB::rollBack();
                        return back()->withErrors(['start_time' => 'Já existe um agendamento neste horário.'])->withInput();
                    }
                    $conflictCount++;
                } else {
                    $appointment = Appointment::create([
                        'title' => $validated['title'],
                        'type' => $validated['type'],
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
                if (!$isRecurring) break;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $message = "Agendamento criado com sucesso!";
        if ($isRecurring) {
            $message = "Foram criados $createdCount agendamentos.";
            if ($conflictCount > 0) {
                $message .= " Atenção: $conflictCount agendamento(s) ignorados devido a conflito de horário.";
            }
        }

        return redirect()->route('appointments.index')->with('success', $message);
    }

    public function events(Request $request)
    {
        $query = Appointment::with('patients');

        if ($request->filled('start')) {
            $query->where('appointment_date', '>=', substr($request->start, 0, 10));
        }

        if ($request->filled('end')) {
            $query->where('appointment_date', '<', substr($request->end, 0, 10));
        }

        $appointments = $query->get();

        $events = $appointments->map(function ($app) {
            $start_datetime = $app->appointment_date->format('Y-m-d') . 'T' . $app->start_time;
            $end_datetime = date('Y-m-d\TH:i:s', strtotime($start_datetime) + ($app->duration_minutes * 60));
            
            $bgColor = $app->type === 'group' ? '#8b5cf6' : '#3b82f6'; // purple for group, blue for individual
            
            $title = $app->title;
            if (!$title && $app->patients->count() > 0) {
                $title = $app->patients->first()->name;
                if ($app->patients->count() > 1) {
                    $title .= ' + ' . ($app->patients->count() - 1);
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
                    'patient_count' => $app->patients->count(),
                    'max_participants' => $app->max_participants
                ]
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
        ]);

        $appointment->update($validated);

        return response()->json(['success' => true]);
    }

    public function show(Appointment $appointment)
    {
        $appointment->load('patients');
        $protocols = \App\Models\ClinicalProtocol::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
            'protocols' => $protocols,
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

            if (!$hasActivePlan && $validated['type'] === 'group') {
                $invalidPatients[] = $patient->name;
            }
        }

        if (count($invalidPatients) > 0) {
            $names = implode(', ', $invalidPatients);
            return back()->withErrors(['patient_ids' => "Os seguintes pacientes não possuem um plano ativo de Pilates ou Aula Teste: $names."])->withInput();
        }

        // Check for schedule conflict
        $conflict = Appointment::where('appointment_date', $validated['appointment_date'])
            ->where('id', '!=', $appointment->id)
            ->where('user_id', auth()->id())
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
                'max_participants' => $validated['max_participants'],
                'appointment_date' => $validated['appointment_date'],
                'start_time' => $validated['start_time'],
                'duration_minutes' => $validated['duration_minutes'],
                'notes' => $validated['notes'],
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
            'status' => 'required|in:scheduled,attended,missed,cancelled'
        ]);

        $appointment->patients()->updateExistingPivot($patientId, [
            'status' => $validated['status']
        ]);

        return back()->with('success', 'Status atualizado com sucesso.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->patients()->detach();
        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Agendamento excluído!');
    }
}
