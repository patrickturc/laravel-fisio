<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipController extends Controller
{
    public function index(Request $request)
    {
        $query = Membership::with('patient')->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $memberships = $query->paginate(15)->withQueryString();

        return Inertia::render('memberships/index', [
            'memberships' => $memberships,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('memberships/create', [
            'patients' => $patients,
            'selectedPatientId' => $request->query('patient_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,expired,cancelled',
        ]);

        $membership = Membership::create($validated);

        // Auto-create a financial transaction for this membership
        if ($membership->price > 0) {
            \App\Models\FinancialTransaction::create([
                'type' => 'income',
                'amount' => $membership->price,
                'date' => $membership->start_date,
                'description' => "Matrícula: {$membership->plan_name}",
                'category' => 'Mensalidade',
                'status' => $membership->status === 'active' ? 'paid' : 'pending',
                'patient_id' => $membership->patient_id,
            ]);
        }

        return redirect()->route('memberships.index')->with('success', 'Matrícula criada com sucesso!');
    }

    public function show(Membership $membership)
    {
        $membership->load('patient');
        return Inertia::render('memberships/show', ['membership' => $membership]);
    }

    public function edit(Membership $membership)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);
        return Inertia::render('memberships/edit', [
            'membership' => $membership,
            'patients' => $patients,
        ]);
    }

    public function update(Request $request, Membership $membership)
    {
        $validated = $request->validate([
            'plan_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,expired,cancelled',
        ]);

        $membership->update($validated);

        return redirect()->route('memberships.index')->with('success', 'Matrícula atualizada com sucesso!');
    }

    public function destroy(Membership $membership)
    {
        $membership->delete();
        return redirect()->route('memberships.index')->with('success', 'Matrícula excluída.');
    }
}
