<?php

namespace App\Http\Controllers;

use App\Models\TreatmentPlan;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TreatmentPlanController extends Controller
{
    public function index(Request $request)
    {
        $query = TreatmentPlan::with('patient')
            ->orderBy('start_date', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%');
            });
        }

        $plans = $query->paginate(15)->withQueryString();

        return Inertia::render('treatment-plans/index', [
            'plans' => $plans,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('treatment-plans/create', [
            'patients' => $patients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'title' => 'required|string|max:255',
            'objective' => 'nullable|string',
            'total_sessions' => 'required|integer|min:1|max:200',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        TreatmentPlan::create($validated);

        return redirect()->route('treatment-plans.index')
            ->with('success', 'Plano de tratamento criado com sucesso!');
    }

    public function show(TreatmentPlan $treatmentPlan)
    {
        $treatmentPlan->load('patient');

        return Inertia::render('treatment-plans/show', [
            'plan' => $treatmentPlan,
        ]);
    }

    public function edit(TreatmentPlan $treatmentPlan)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name']);

        return Inertia::render('treatment-plans/edit', [
            'plan' => $treatmentPlan,
            'patients' => $patients,
        ]);
    }

    public function update(Request $request, TreatmentPlan $treatmentPlan)
    {
        $validated = $request->validate([
            'patient_id' => 'required|uuid|exists:patients,id',
            'title' => 'required|string|max:255',
            'objective' => 'nullable|string',
            'total_sessions' => 'required|integer|min:1|max:200',
            'completed_sessions' => 'required|integer|min:0',
            'status' => 'required|in:active,paused,completed',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        $treatmentPlan->update($validated);

        return redirect()->route('treatment-plans.show', $treatmentPlan)
            ->with('success', 'Plano de tratamento atualizado!');
    }

    public function destroy(TreatmentPlan $treatmentPlan)
    {
        $treatmentPlan->delete();

        return redirect()->route('treatment-plans.index')
            ->with('success', 'Plano de tratamento excluído!');
    }
}
