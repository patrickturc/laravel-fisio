<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\GroupClass;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GroupClassController extends Controller
{
    public function index()
    {
        // Order the classes by their earliest weekly slot (weekday, then time):
        // Monday classes first, then Tuesday, etc. Classes without a schedule go last.
        $groupClasses = GroupClass::with(['schedules', 'patients'])
            ->withMax('appointments', 'appointment_date')
            ->get()
            ->sortBy(function (GroupClass $groupClass) {
                $earliest = $groupClass->schedules
                    ->sortBy(fn ($s) => sprintf('%d-%s', $s->day_of_week, $s->start_time))
                    ->first();

                return $earliest
                    ? sprintf('%d-%s', $earliest->day_of_week, $earliest->start_time)
                    : '9-99:99:99';
            })
            ->values();

        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('group-classes/index', [
            'groupClasses' => $groupClasses,
            'patients' => $patients,
            'users' => $users,
        ]);
    }

    public function show(GroupClass $groupClass)
    {
        $groupClass->load(['schedules', 'patients']);

        $futureAppointments = $groupClass->appointments()
            ->where('appointment_date', '>=', now()->format('Y-m-d'))
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->with('patients')
            ->get();

        // Last date for which appointments have been generated for this class.
        $lastAppointmentDate = $groupClass->appointments()->max('appointment_date');

        $occupancy = $this->occupancyStats($groupClass);

        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('group-classes/show', [
            'groupClass' => $groupClass,
            'futureAppointments' => $futureAppointments,
            'lastAppointmentDate' => $lastAppointmentDate,
            'occupancy' => $occupancy,
            'patients' => $patients,
            'users' => $users,
        ]);
    }

    /**
     * Propagate roster changes to the class's future scheduled appointments:
     * newly-added students join upcoming classes (respecting capacity) and
     * removed students are dropped only where still merely "scheduled"
     * (attendance history and one-off drop-ins are preserved).
     *
     * @param  list<string>  $added
     * @param  list<string>  $removed
     */
    private function syncRosterToFutureAppointments(GroupClass $groupClass, array $added, array $removed): void
    {
        if (empty($added) && empty($removed)) {
            return;
        }

        $futureAppointments = $groupClass->appointments()
            ->where('appointment_date', '>=', now()->format('Y-m-d'))
            ->where('status', 'scheduled')
            ->with('patients')
            ->get();

        foreach ($futureAppointments as $appointment) {
            if (! empty($removed)) {
                $toDetach = $appointment->patients
                    ->whereIn('id', $removed)
                    ->filter(fn ($p) => $p->pivot->status === 'scheduled')
                    ->pluck('id')
                    ->all();

                if (! empty($toDetach)) {
                    $appointment->patients()->detach($toDetach);
                }
            }

            if (! empty($added)) {
                $current = $appointment->patients
                    ->filter(fn ($p) => $p->pivot->status !== 'cancelled')
                    ->pluck('id');

                $room = $appointment->max_participants - $current->count();
                $existing = $appointment->patients->pluck('id');

                foreach ($added as $patientId) {
                    if ($room <= 0) {
                        break;
                    }
                    if ($existing->contains($patientId)) {
                        continue;
                    }

                    $appointment->patients()->attach($patientId, ['status' => 'scheduled']);
                    $room--;
                }
            }
        }
    }

    /**
     * Occupancy and attendance stats for a class across its appointments.
     *
     * @return array{total_classes:int, avg_participants:float, occupancy_rate:int, attended:int, missed:int, cancelled:int, attendance_rate:int}
     */
    private function occupancyStats(GroupClass $groupClass): array
    {
        $appointmentIds = $groupClass->appointments()->pluck('id');
        $totalClasses = $appointmentIds->count();

        $avgParticipants = 0.0;
        if ($totalClasses > 0) {
            // Active enrollments (excludes per-patient cancellations).
            $totalParticipants = DB::table('appointment_patient')
                ->whereIn('appointment_id', $appointmentIds)
                ->whereIn('status', ['scheduled', 'attended', 'missed'])
                ->count();
            $avgParticipants = round($totalParticipants / $totalClasses, 1);
        }

        $occupancyRate = $groupClass->max_participants > 0
            ? (int) round(($avgParticipants / $groupClass->max_participants) * 100)
            : 0;

        $statusCounts = DB::table('appointment_patient')
            ->whereIn('appointment_id', $appointmentIds)
            ->selectRaw('status, count(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $attended = (int) ($statusCounts['attended'] ?? 0);
        $missed = (int) ($statusCounts['missed'] ?? 0);
        $cancelled = (int) ($statusCounts['cancelled'] ?? 0);
        $attendanceRate = ($attended + $missed) > 0
            ? (int) round(($attended / ($attended + $missed)) * 100)
            : 0;

        return [
            'total_classes' => $totalClasses,
            'avg_participants' => $avgParticipants,
            'occupancy_rate' => $occupancyRate,
            'attended' => $attended,
            'missed' => $missed,
            'cancelled' => $cancelled,
            'attendance_rate' => $attendanceRate,
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'patient_ids' => 'nullable|array',
            'patient_ids.*' => 'exists:patients,id',
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required',
            'schedules.*.duration_minutes' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $groupClass = GroupClass::create([
                'user_id' => $request->input('user_id', auth()->id()),
                'name' => $validated['name'],
                'color' => $request->input('color', '#8b5cf6'),
                'max_participants' => $validated['max_participants'],
            ]);

            foreach ($validated['schedules'] as $schedule) {
                $groupClass->schedules()->create($schedule);
            }

            if (! empty($validated['patient_ids'])) {
                $groupClass->patients()->attach($validated['patient_ids']);
            }

            DB::commit();

            return redirect()->route('group-classes.show', $groupClass->id)->with('success', 'Turma criada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erro ao criar turma: '.$e->getMessage());
        }
    }

    public function update(Request $request, GroupClass $groupClass)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'max_participants' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:active,inactive',
            'patient_ids' => 'sometimes|nullable|array',
            'patient_ids.*' => 'exists:patients,id',
            'schedules' => 'sometimes|nullable|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required',
            'schedules.*.duration_minutes' => 'required|integer|min:10',
            'color' => 'sometimes|nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $groupClass->update([
                'user_id' => $request->input('user_id', auth()->id()),
                'name' => $request->has('name') ? $validated['name'] : $groupClass->name,
                'color' => $request->has('color') ? $validated['color'] : $groupClass->color,
                'max_participants' => $request->has('max_participants') ? $validated['max_participants'] : $groupClass->max_participants,
                'status' => $request->has('status') ? $validated['status'] : $groupClass->status,
            ]);

            // Sync the name and max_participants to all future scheduled appointments automatically
            Appointment::where('group_class_id', $groupClass->id)
                ->where('appointment_date', '>=', now()->format('Y-m-d'))
                ->where('status', 'scheduled')
                ->update([
                    'title' => $groupClass->name,
                    'max_participants' => $groupClass->max_participants,
                ]);

            if ($request->has('schedules') && isset($validated['schedules'])) {
                $groupClass->schedules()->delete();
                foreach ($validated['schedules'] as $schedule) {
                    $groupClass->schedules()->create($schedule);
                }
            }

            if ($request->has('patient_ids')) {
                $oldRoster = $groupClass->patients()->pluck('patients.id')->all();
                $newRoster = isset($validated['patient_ids']) ? $validated['patient_ids'] : [];

                $groupClass->patients()->sync($newRoster);

                $added = array_values(array_diff($newRoster, $oldRoster));
                $removed = array_values(array_diff($oldRoster, $newRoster));
                $this->syncRosterToFutureAppointments($groupClass, $added, $removed);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Turma atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erro ao atualizar turma: '.$e->getMessage());
        }
    }

    public function destroy(GroupClass $groupClass)
    {
        $groupClass->delete();

        return redirect()->route('group-classes.index')->with('success', 'Turma excluída com sucesso!');
    }

    /**
     * Number of weeks of classes to keep generated ahead.
     */
    public const HORIZON_WEEKS = 8;

    public function generateAppointments(Request $request, GroupClass $groupClass)
    {
        $validated = $request->validate([
            'end_date' => 'required|date|after:today',
            'reschedule' => 'nullable|boolean',
        ]);

        try {
            $result = DB::transaction(fn () => $this->generateForClass(
                $groupClass,
                Carbon::parse($validated['end_date']),
                $validated['reschedule'] ?? false,
            ));

            $msg = "✅ {$result['created']} aulas geradas com sucesso!";
            if (($validated['reschedule'] ?? false) && $result['deleted'] > 0) {
                $msg = "✅ {$result['deleted']} aulas antigas removidas e {$result['created']} novas aulas geradas!";
            }
            if ($result['conflicts'] > 0) {
                $msg .= " Atenção: {$result['conflicts']} aula(s) ignorada(s) por conflito de horário do profissional.";
            }

            return back()->with('success', $msg);
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao gerar agendamentos: '.$e->getMessage());
        }
    }

    /**
     * Extend every active class up to the rolling horizon. Triggered by the
     * dashboard "extend classes" action.
     */
    public function extendActiveClasses(Request $request)
    {
        $endDate = Carbon::today()->addWeeks(self::HORIZON_WEEKS);
        $totalCreated = 0;
        $classes = 0;

        try {
            DB::transaction(function () use ($endDate, &$totalCreated, &$classes) {
                GroupClass::where('status', 'active')->with(['schedules', 'patients'])->get()
                    ->each(function (GroupClass $groupClass) use ($endDate, &$totalCreated, &$classes) {
                        $result = $this->generateForClass($groupClass, $endDate, false);
                        $totalCreated += $result['created'];
                        if ($result['created'] > 0) {
                            $classes++;
                        }
                    });
            });

            return back()->with('success', "✅ {$totalCreated} aulas geradas em {$classes} turma(s) (próximas ".self::HORIZON_WEEKS.' semanas).');
        } catch (\Exception $e) {
            return back()->with('error', 'Erro ao estender aulas: '.$e->getMessage());
        }
    }

    /**
     * Core generation: materialise a class's weekly schedules into concrete
     * appointments up to $endDate. Returns counts of created/deleted/conflicts.
     *
     * @return array{created:int, deleted:int, conflicts:int}
     */
    private function generateForClass(GroupClass $groupClass, Carbon $endDate, bool $reschedule): array
    {
        $groupClass->loadMissing(['schedules', 'patients']);

        $startDate = Carbon::today();
        $userId = $groupClass->user_id ?? auth()->id();

        // Respect the class capacity: never enroll more students than max_participants.
        $patientIds = array_slice($groupClass->patients->pluck('id')->toArray(), 0, $groupClass->max_participants);

        $createdCount = 0;
        $deletedCount = 0;
        $conflictCount = 0;

        if ($reschedule) {
            $deletedCount = Appointment::where('group_class_id', $groupClass->id)
                ->where('appointment_date', '>=', $startDate->format('Y-m-d'))
                ->where('status', 'scheduled')
                ->delete();
        }

        foreach ($groupClass->schedules as $schedule) {
            $currentDate = $startDate->copy();

            while ($currentDate->dayOfWeek !== $schedule->day_of_week) {
                $currentDate->addDay();
            }

            while ($currentDate->lessThanOrEqualTo($endDate)) {
                $dateString = $currentDate->format('Y-m-d');

                $exists = Appointment::where('group_class_id', $groupClass->id)
                    ->whereDate('appointment_date', $dateString)
                    ->where(function ($q) use ($schedule) {
                        // Match the exact slot (new data) or the time (legacy data
                        // generated before schedule_id existed).
                        $q->where('schedule_id', $schedule->id)
                            ->orWhere('start_time', $schedule->start_time);
                    })
                    ->exists();

                // Skip if the instructor already has an overlapping appointment
                // (another class or individual session) at this time. Overlap is
                // computed in PHP so it works on any database driver.
                $newStart = strtotime($schedule->start_time);
                $newEnd = $newStart + ($schedule->duration_minutes * 60);
                $conflict = Appointment::where('appointment_date', $dateString)
                    ->where('user_id', $userId)
                    ->where('group_class_id', '!=', $groupClass->id)
                    ->get(['start_time', 'duration_minutes'])
                    ->contains(function ($other) use ($newStart, $newEnd) {
                        $otherStart = strtotime($other->start_time);
                        $otherEnd = $otherStart + ($other->duration_minutes * 60);

                        return $otherStart < $newEnd && $otherEnd > $newStart;
                    });

                if (! $exists && $conflict) {
                    $conflictCount++;
                } elseif (! $exists) {
                    $appointment = Appointment::create([
                        'user_id' => $userId,
                        'group_class_id' => $groupClass->id,
                        'schedule_id' => $schedule->id,
                        'title' => $groupClass->name,
                        'type' => 'group',
                        'max_participants' => $groupClass->max_participants,
                        'appointment_date' => $dateString,
                        'start_time' => $schedule->start_time,
                        'duration_minutes' => $schedule->duration_minutes,
                    ]);

                    foreach ($patientIds as $patientId) {
                        $appointment->patients()->attach($patientId, ['status' => 'scheduled']);
                    }

                    $createdCount++;
                }

                $currentDate->addWeek();
            }
        }

        return ['created' => $createdCount, 'deleted' => $deletedCount, 'conflicts' => $conflictCount];
    }

    public function updateFutureAppointments(Request $request, GroupClass $groupClass)
    {
        $groupClass->load('schedules');

        $today = Carbon::today()->format('Y-m-d');

        $updated = Appointment::where('group_class_id', $groupClass->id)
            ->where('appointment_date', '>=', $today)
            ->where('status', 'scheduled')
            ->get();

        $count = 0;
        foreach ($updated as $appointment) {
            // Prefer the exact originating schedule slot when known.
            $matchingSchedule = $appointment->schedule_id
                ? $groupClass->schedules->firstWhere('id', $appointment->schedule_id)
                : null;

            if (! $matchingSchedule) {
                // Legacy fallback: match by weekday, disambiguating by start_time
                // so multiple sessions on the same day keep their own slot.
                $appointmentDay = Carbon::parse($appointment->appointment_date)->dayOfWeek;
                $sameDay = $groupClass->schedules->filter(function ($s) use ($appointmentDay) {
                    return $s->day_of_week === $appointmentDay;
                });

                $matchingSchedule = $sameDay->first(function ($s) use ($appointment) {
                    return substr((string) $s->start_time, 0, 5) === substr((string) $appointment->start_time, 0, 5);
                }) ?? $sameDay->first();
            }

            if ($matchingSchedule) {
                $appointment->update([
                    'start_time' => $matchingSchedule->start_time,
                    'duration_minutes' => $matchingSchedule->duration_minutes,
                    'title' => $groupClass->name,
                    'max_participants' => $groupClass->max_participants,
                ]);
                $count++;
            }
        }

        return back()->with('success', "✅ {$count} agendamentos futuros atualizados com o novo horário!");
    }
}
