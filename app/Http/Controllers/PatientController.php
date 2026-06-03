<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::with('activeMembership')->orderBy('name');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                  ->orWhere('nickname', 'ilike', '%' . $request->search . '%')
                  ->orWhere('cpf', 'ilike', '%' . $request->search . '%')
                  ->orWhere('email', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $patients = $query->paginate(20)->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'type']),
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
            'nickname' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'birthdate' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'type' => 'required|in:pilates,physiotherapy',
            'cpf' => 'nullable|string|max:14',
            'rg' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'health_notes' => 'nullable|string|max:2000',
            'cep' => 'nullable|string|max:10',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'complement' => 'nullable|string|max:100',
            'neighborhood' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
        ]);

        $validated['user_id'] = auth()->id();
        Patient::create($validated);

        return redirect()->route('patients.index')
            ->with('success', 'Paciente cadastrado com sucesso!');
    }

    public function show(Patient $patient)
    {
        $patient->load([
            'appointments' => fn($q) => $q->orderBy('appointment_date', 'desc'),
            'evolutions' => fn($q) => $q->orderBy('data_atendimento', 'desc'),
            'memberships' => fn($q) => $q->orderBy('end_date', 'desc'),
        ]);

        $protocols = \App\Models\ClinicalProtocol::orderBy('name')->get(['id', 'name', 'total_sessions']);
        $commercialPlans = \App\Models\CommercialPlan::orderBy('name')->get(['id', 'name', 'price', 'duration_months']);

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'protocols' => $protocols,
            'commercialPlans' => $commercialPlans,
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
            'name' => 'sometimes|required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'birthdate' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'type' => 'sometimes|required|in:pilates,physiotherapy',
            'cpf' => 'nullable|string|max:14',
            'rg' => 'nullable|string|max:20',
            'profession' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'health_notes' => 'nullable|string|max:2000',
            'cep' => 'nullable|string|max:10',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'complement' => 'nullable|string|max:100',
            'neighborhood' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
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
