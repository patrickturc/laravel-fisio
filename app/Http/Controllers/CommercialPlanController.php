<?php

namespace App\Http\Controllers;

use App\Models\CommercialPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommercialPlanController extends Controller
{
    public function index()
    {
        $plans = CommercialPlan::orderBy('name')->get();
        return Inertia::render('commercial-plans/index', ['plans' => $plans]);
    }

    public function create()
    {
        return Inertia::render('commercial-plans/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'nullable|integer|min:1',
            'description' => 'nullable|string|max:1000',
        ]);

        CommercialPlan::create($validated);

        return redirect()->route('commercial-plans.index')->with('success', 'Plano comercial criado com sucesso!');
    }

    public function edit(CommercialPlan $commercialPlan)
    {
        return Inertia::render('commercial-plans/edit', ['plan' => $commercialPlan]);
    }

    public function update(Request $request, CommercialPlan $commercialPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_months' => 'nullable|integer|min:1',
            'description' => 'nullable|string|max:1000',
        ]);

        $commercialPlan->update($validated);

        return redirect()->route('commercial-plans.index')->with('success', 'Plano comercial atualizado com sucesso!');
    }

    public function destroy(CommercialPlan $commercialPlan)
    {
        $commercialPlan->delete();
        return redirect()->route('commercial-plans.index')->with('success', 'Plano comercial excluído.');
    }
}
