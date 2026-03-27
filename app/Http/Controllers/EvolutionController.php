<?php

namespace App\Http\Controllers;

use App\Models\Evolution;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvolutionController extends Controller
{
    public function index()
    {
        $evolutions = Evolution::with(['patient'])
            ->orderBy('data_atendimento', 'desc')
            ->get();

        return Inertia::render('evolutions/index', [
            'evolutions' => $evolutions
        ]);
    }

    public function create(Request $request)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name', 'type']);

        return Inertia::render('evolutions/create', [
            'patients' => $patients,
            'selectedPatientId' => $request->query('paciente_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|uuid|exists:patients,id',
            'data_atendimento' => 'required|date',
            'tipo_atendimento' => 'required|in:avaliacao,reavaliacao,sessao',
            'queixa_principal' => 'nullable|string',
            'relato_paciente' => 'nullable|string',
            'dor_eva' => 'nullable|integer|min:0|max:10',
            'localizacao_dor' => 'nullable|string',
            'tipo_dor' => 'nullable|string',
            'pressao_arterial' => 'nullable|string',
            'frequencia_cardiaca' => 'nullable|string',
            'saturacao' => 'nullable|string',
            'amplitude_movimento' => 'nullable|string',
            'forca_muscular' => 'nullable|string',
            'avaliacao_funcional' => 'nullable|string',
            'avaliacao_postural' => 'nullable|string',
            'condutas_realizadas' => 'nullable|string',
            'parametros_conduta' => 'nullable|string',
            'resposta_tratamento' => 'nullable|string',
            'evolucao_status' => 'nullable|string',
            'analise_profissional' => 'nullable|string',
            'conduta_planejada' => 'nullable|string',
            'orientacoes_domiciliares' => 'nullable|string',
        ]);

        Evolution::create($validated);

        return redirect()->route('evolutions.index')
            ->with('success', 'Evolução registrada com sucesso!');
    }

    public function show(Evolution $evolution)
    {
        $evolution->load(['patient', 'professional']);

        return Inertia::render('evolutions/show', [
            'evolution' => $evolution
        ]);
    }

    public function edit(Evolution $evolution)
    {
        $patients = Patient::orderBy('name')->get(['id', 'name', 'type']);

        return Inertia::render('evolutions/edit', [
            'evolution' => $evolution,
            'patients' => $patients,
        ]);
    }

    public function update(Request $request, Evolution $evolution)
    {
        $validated = $request->validate([
            'paciente_id' => 'required|uuid|exists:patients,id',
            'data_atendimento' => 'required|date',
            'tipo_atendimento' => 'required|in:avaliacao,reavaliacao,sessao',
            'queixa_principal' => 'nullable|string',
            'relato_paciente' => 'nullable|string',
            'dor_eva' => 'nullable|integer|min:0|max:10',
            'localizacao_dor' => 'nullable|string',
            'condutas_realizadas' => 'nullable|string',
            'analise_profissional' => 'nullable|string',
            'conduta_planejada' => 'nullable|string',
            'orientacoes_domiciliares' => 'nullable|string',
        ]);

        $evolution->update($validated);

        return redirect()->route('evolutions.show', $evolution)
            ->with('success', 'Evolução atualizada!');
    }

    public function destroy(Evolution $evolution)
    {
        $evolution->delete();

        return redirect()->route('evolutions.index')
            ->with('success', 'Evolução excluída!');
    }
}
