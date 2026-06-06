<?php

namespace App\Http\Controllers;

use App\Models\GroupClass;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GroupClassController extends Controller
{
    public function index()
    {
        $groupClasses = GroupClass::with(['schedules', 'patients'])->orderBy('name')->get();
        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('group-classes/index', [
            'groupClasses' => $groupClasses,
            'patients' => $patients,
            'users' => $users
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

        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('group-classes/show', [
            'groupClass' => $groupClass,
            'futureAppointments' => $futureAppointments,
            'patients' => $patients,
            'users' => $users
        ]);
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

            if (!empty($validated['patient_ids'])) {
                $groupClass->patients()->attach($validated['patient_ids']);
            }

            DB::commit();
            return redirect()->route('group-classes.show', $groupClass->id)->with('success', 'Turma criada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao criar turma: ' . $e->getMessage());
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
                if (isset($validated['patient_ids'])) {
                    $groupClass->patients()->sync($validated['patient_ids']);
                } else {
                    $groupClass->patients()->detach();
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Turma atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao atualizar turma: ' . $e->getMessage());
        }
    }

    public function destroy(GroupClass $groupClass)
    {
        $groupClass->delete();
        return redirect()->route('group-classes.index')->with('success', 'Turma excluída com sucesso!');
    }

    public function generateAppointments(Request $request, GroupClass $groupClass)
    {
        $validated = $request->validate([
            'end_date' => 'required|date|after:today',
            'reschedule' => 'nullable|boolean',
        ]);

        $groupClass->load(['schedules', 'patients']);
        
        $startDate = Carbon::today();
        $endDate = Carbon::parse($validated['end_date']);
        $reschedule = $validated['reschedule'] ?? false;
        
        $schedules = $groupClass->schedules;
        $patientIds = $groupClass->patients->pluck('id')->toArray();
        $userId = auth()->id();
        
        $createdCount = 0;
        $deletedCount = 0;

        DB::beginTransaction();
        try {
            // If reschedule mode, delete all future scheduled (non-completed) appointments for this class
            if ($reschedule) {
                $deletedCount = Appointment::where('group_class_id', $groupClass->id)
                    ->where('appointment_date', '>=', $startDate->format('Y-m-d'))
                    ->where('status', 'scheduled')
                    ->delete();
            }

            foreach ($schedules as $schedule) {
                $currentDate = $startDate->copy();
                
                while ($currentDate->dayOfWeek !== $schedule->day_of_week) {
                    $currentDate->addDay();
                }
                
                while ($currentDate->lessThanOrEqualTo($endDate)) {
                    $dateString = $currentDate->format('Y-m-d');
                    
                    $exists = Appointment::where('group_class_id', $groupClass->id)
                        ->where('appointment_date', $dateString)
                        ->where('start_time', $schedule->start_time)
                        ->exists();
                        
                    if (!$exists) {
                        $appointment = Appointment::create([
                            'user_id' => $userId,
                            'group_class_id' => $groupClass->id,
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
            DB::commit();
            
            $msg = "✅ {$createdCount} aulas geradas com sucesso!";
            if ($reschedule && $deletedCount > 0) {
                $msg = "✅ {$deletedCount} aulas antigas removidas e {$createdCount} novas aulas geradas!";
            }
            
            return back()->with('success', $msg);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao gerar agendamentos: ' . $e->getMessage());
        }
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
            // Find the matching schedule for this appointment's day of week
            $appointmentDay = Carbon::parse($appointment->appointment_date)->dayOfWeek;
            $matchingSchedule = $groupClass->schedules->first(function ($s) use ($appointmentDay) {
                return $s->day_of_week === $appointmentDay;
            });
            
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
