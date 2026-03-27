<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::orderBy('name')->get();

        return Inertia::render('patients/index', [
            'patients' => $patients
        ]);
    }

    public function create()
    {
        return Inertia::render('patients/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'type' => 'required|in:pilates,physiotherapy',
            'cpf' => 'nullable|string|max:14',
            'address' => 'nullable|string|max:500',
        ]);

        Patient::create($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Paciente cadastrado com sucesso!');
    }

    public function show(Patient $patient)
    {
        $patient->load([
            'appointments' => fn($q) => $q->orderBy('appointment_date', 'desc'),
            'evolutions' => fn($q) => $q->orderBy('data_atendimento', 'desc'),
        ]);

        return Inertia::render('patients/show', [
            'patient' => $patient
        ]);
    }

    public function edit(Patient $patient)
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'type' => 'required|in:pilates,physiotherapy',
            'cpf' => 'nullable|string|max:14',
            'address' => 'nullable|string|max:500',
        ]);

        $patient->update($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Paciente atualizado com sucesso!');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', 'Paciente excluído com sucesso!');
    }
}
