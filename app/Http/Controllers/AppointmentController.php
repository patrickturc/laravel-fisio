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
        ]);

        // Check for schedule conflict
        $conflict = Appointment::where('appointment_date', $validated['appointment_date'])
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

        Appointment::create($validated);

        return redirect()->route('appointments.index')
            ->with('success', 'Agendamento criado com sucesso!');
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
