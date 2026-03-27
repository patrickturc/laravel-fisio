<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with('patient')
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('appointments/index', [
            'appointments' => $appointments
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
