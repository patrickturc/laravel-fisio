<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with('patient')
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%');
            });
        }

        $appointments = $query->paginate(15)->withQueryString();

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
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
            'patient_id' => 'required|uuid|exists:patients,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'duration_minutes' => 'required|integer|min:10|max:180',
            'status' => 'required|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
            'is_recurring' => 'nullable|boolean',
            'recurrence_end_date' => 'nullable|required_if:is_recurring,true|date|after_or_equal:appointment_date',
        ]);

        $userId = auth()->id();
        $isRecurring = $request->boolean('is_recurring');
        $endDate = $isRecurring ? \Carbon\Carbon::parse($validated['recurrence_end_date']) : \Carbon\Carbon::parse($validated['appointment_date']);
        $currentDate = \Carbon\Carbon::parse($validated['appointment_date']);
        
        $createdCount = 0;
        $conflictCount = 0;

        while ($currentDate->lessThanOrEqualTo($endDate)) {
            $dateString = $currentDate->format('Y-m-d');

            // Check for schedule conflict
            $conflict = Appointment::where('appointment_date', $dateString)
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
                // If it's the very first requested date, we fail immediately to let the user know
                if ($createdCount === 0 && !$isRecurring) {
                    return back()->withErrors(['start_time' => 'Já existe um agendamento neste horário.'])->withInput();
                }
                $conflictCount++;
            } else {
                Appointment::create([
                    'patient_id' => $validated['patient_id'],
                    'appointment_date' => $dateString,
                    'start_time' => $validated['start_time'],
                    'duration_minutes' => $validated['duration_minutes'],
                    'status' => $validated['status'],
                    'notes' => $validated['notes'],
                    'user_id' => $userId,
                ]);
                $createdCount++;
            }

            // Move to next week
            $currentDate->addWeek();
            
            if (!$isRecurring) {
                break;
            }
        }

        $message = "Agendamento criado com sucesso!";
        if ($isRecurring) {
            $message = "Foram criados $createdCount agendamentos.";
            if ($conflictCount > 0) {
                $message .= " Atenção: $conflictCount agendamento(s) não puderam ser criados devido a conflito de horário.";
            }
        }

        return redirect()->route('appointments.index')->with('success', $message);
    }

    public function events(Request $request)
    {
        $query = Appointment::with('patient');

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
            
            $bgColor = '#3b82f6'; // default blue
            if ($app->status === 'completed') $bgColor = '#10b981'; // emerald
            if ($app->status === 'cancelled') $bgColor = '#ef4444'; // red

            return [
                'id' => $app->id,
                'title' => $app->patient ? $app->patient->name : 'Consulta',
                'start' => $start_datetime,
                'end' => $end_datetime,
                'backgroundColor' => $bgColor,
                'borderColor' => 'transparent',
                'extendedProps' => [
                    'status' => $app->status,
                    'patient_id' => $app->patient_id,
                ]
            ];
        });

        return response()->json($events);
    }


    public function show(Appointment $appointment)
    {
        $appointment->load('patient');

        return Inertia::render('appointments/show', [
            'appointment' => $appointment
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
            'patients' => $patients,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'duration_minutes' => 'required|integer|min:10|max:180',
            'status' => 'required|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check for schedule conflict (exclude current appointment)
        $conflict = Appointment::where('appointment_date', $validated['appointment_date'])
            ->where('id', '!=', $appointment->id)
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

        $appointment->update($validated);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Agendamento atualizado!');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Agendamento excluído!');
    }
}
