<?php

namespace App\Http\Controllers;

use App\Models\GroupClass;
use App\Models\Patient;
use App\Models\Appointment;
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
        return Inertia::render('group-classes/index', [
            'groupClasses' => $groupClasses,
            'patients' => $patients
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

        return Inertia::render('group-classes/show', [
            'groupClass' => $groupClass,
            'futureAppointments' => $futureAppointments,
            'patients' => $patients
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.duration_minutes' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $groupClass = GroupClass::create([
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'max_participants' => $validated['max_participants'],
            ]);

            foreach ($validated['schedules'] as $schedule) {
                $groupClass->schedules()->create($schedule);
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
            'name' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'patient_ids' => 'nullable|array',
            'patient_ids.*' => 'exists:patients,id',
            'schedules' => 'nullable|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required',
            'schedules.*.duration_minutes' => 'required|integer|min:10',
        ]);

        DB::beginTransaction();
        try {
            $groupClass->update([
                'name' => $validated['name'],
                'max_participants' => $validated['max_participants'],
                'status' => $validated['status'],
            ]);

            if (isset($validated['schedules'])) {
                $groupClass->schedules()->delete();
                foreach ($validated['schedules'] as $schedule) {
                    $groupClass->schedules()->create($schedule);
                }
            }

            if (isset($validated['patient_ids'])) {
                $groupClass->patients()->sync($validated['patient_ids']);
            } else {
                $groupClass->patients()->detach();
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
            'weeks' => 'required|integer|min:1|max:52',
            'start_date' => 'required|date',
        ]);

        $groupClass->load(['schedules', 'patients']);
        
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = $startDate->copy()->addWeeks($validated['weeks']);
        
        $schedules = $groupClass->schedules;
        $patientIds = $groupClass->patients->pluck('id')->toArray();
        $userId = auth()->id();
        
        $createdCount = 0;

        DB::beginTransaction();
        try {
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
            return back()->with('success', "Foram gerados $createdCount agendamentos com sucesso!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erro ao gerar agendamentos: ' . $e->getMessage());
        }
    }
}
