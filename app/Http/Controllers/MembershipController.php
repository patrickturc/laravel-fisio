<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Patient;
use App\Models\CommercialPlan;
use App\Models\FinancialTransaction;
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
        $commercialPlans = CommercialPlan::orderBy('name')->get(['id', 'name', 'price', 'duration_months']);
        
        return Inertia::render('memberships/create', [
            'patients' => $patients,
            'commercialPlans' => $commercialPlans,
            'selectedPatientId' => $request->query('patient_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'commercial_plan_id' => 'nullable|uuid|exists:commercial_plans,id',
            'plan_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,expired,cancelled',
            'billing_day' => 'nullable|integer|min:1|max:31',
        ]);

        $membership = Membership::create($validated);

        // Auto-create first financial transaction for this membership
        if ($membership->price > 0) {
            $planNameDesc = $membership->commercialPlan ? $membership->commercialPlan->name : $membership->plan_name;
            $patient = Patient::find($membership->patient_id);
            $dueDate = $membership->billing_day
                ? $membership->start_date->copy()->day(min($membership->billing_day, $membership->start_date->daysInMonth))
                : $membership->start_date;

            FinancialTransaction::create([
                'type' => 'income',
                'amount' => $membership->price,
                'date' => $membership->start_date,
                'due_date' => $dueDate,
                'description' => "Mensalidade: {$planNameDesc} — {$patient->name}",
                'category' => 'Mensalidade',
                'status' => 'pending',
                'patient_id' => $membership->patient_id,
                'membership_id' => $membership->id,
            ]);
        }

        return redirect()->route('memberships.index')->with('success', 'Matrícula criada com sucesso!');
    }

    public function show(Membership $membership)
    {
        $membership->load(['patient', 'commercialPlan', 'financialTransactions' => function ($q) {
            $q->orderBy('date', 'desc');
        }]);
        return Inertia::render('memberships/show', ['membership' => $membership]);
    }

    public function edit(Membership $membership)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);
        $commercialPlans = CommercialPlan::orderBy('name')->get(['id', 'name', 'price', 'duration_months']);
        return Inertia::render('memberships/edit', [
            'membership' => $membership,
            'patients' => $patients,
            'commercialPlans' => $commercialPlans,
        ]);
    }

    public function update(Request $request, Membership $membership)
    {
        $validated = $request->validate([
            'commercial_plan_id' => 'nullable|uuid|exists:commercial_plans,id',
            'plan_name' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,expired,cancelled',
            'billing_day' => 'nullable|integer|min:1|max:31',
        ]);

        $membership->update($validated);

        return redirect()->route('memberships.index')->with('success', 'Matrícula atualizada com sucesso!');
    }

    public function destroy(Membership $membership)
    {
        // Delete pending financial transactions linked to this membership
        $membership->financialTransactions()->where('status', 'pending')->delete();
        $membership->delete();
        return redirect()->route('memberships.index')->with('success', 'Matrícula excluída.');
    }

    public function renew(Membership $membership)
    {
        // Update old membership to expired
        if ($membership->status === 'active') {
            $membership->update(['status' => 'expired']);
        }

        $oldStart = \Carbon\Carbon::parse($membership->start_date);
        $oldEnd = \Carbon\Carbon::parse($membership->end_date);
        $durationDays = $oldStart->diffInDays($oldEnd);

        // Usually start next day after expiration
        $newStart = $oldEnd->copy()->addDay();
        $newEnd = $newStart->copy()->addDays($durationDays);

        $newMembership = Membership::create([
            'patient_id' => $membership->patient_id,
            'commercial_plan_id' => $membership->commercial_plan_id,
            'plan_name' => $membership->plan_name,
            'start_date' => $newStart->format('Y-m-d'),
            'end_date' => $newEnd->format('Y-m-d'),
            'price' => $membership->price,
            'status' => 'active',
            'billing_day' => $membership->billing_day,
        ]);

        if ($newMembership->price > 0) {
            $planNameDesc = $newMembership->commercialPlan ? $newMembership->commercialPlan->name : $newMembership->plan_name;
            $patient = Patient::find($newMembership->patient_id);
            $dueDate = $newMembership->billing_day
                ? $newStart->copy()->day(min($newMembership->billing_day, $newStart->daysInMonth))
                : $newStart;

            FinancialTransaction::create([
                'type' => 'income',
                'amount' => $newMembership->price,
                'date' => $newMembership->start_date,
                'due_date' => $dueDate,
                'description' => "Mensalidade: {$planNameDesc} — {$patient->name}",
                'category' => 'Mensalidade',
                'status' => 'pending',
                'patient_id' => $newMembership->patient_id,
                'membership_id' => $newMembership->id,
            ]);
        }

        return redirect()->route('memberships.show', $newMembership)->with('success', 'Matrícula renovada com sucesso!');
    }
}
