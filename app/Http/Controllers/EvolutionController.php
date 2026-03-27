<?php

namespace App\Http\Controllers;

use App\Models\Evolution;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class EvolutionController extends Controller
{
    public function index(Request $request)
    {
        $query = Evolution::with(['patient'])
            ->orderBy('data_atendimento', 'desc');

        if ($request->filled('search')) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_atendimento', $request->tipo);
        }

        $evolutions = $query->paginate(15)->withQueryString();

        return Inertia::render('evolutions/index', [
            'evolutions' => $evolutions,
            'filters' => $request->only(['search', 'tipo']),
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

    public function pdf(Evolution $evolution)
    {
        $evolution->load(['patient', 'professional']);

        $tipo = ['avaliacao' => 'Avaliação', 'reavaliacao' => 'Reavaliação', 'sessao' => 'Sessão'][$evolution->tipo_atendimento] ?? $evolution->tipo_atendimento;
        $date = \Carbon\Carbon::parse($evolution->data_atendimento)->format('d/m/Y');

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 40px; font-size: 14px; }
            h1 { color: #6366f1; font-size: 22px; margin-bottom: 4px; }
            h2 { color: #6366f1; font-size: 16px; margin-top: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; }
            .header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
            .meta { color: #666; font-size: 13px; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
            .field-value { margin-top: 2px; }
            .vitals { display: flex; gap: 24px; }
            .vital-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 16px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #999; font-size: 11px; text-align: center; }
        </style></head><body>';

        $html .= '<div class="header">';
        $html .= '<h1>Evolução Clínica (SOAP)</h1>';
        $html .= '<p class="meta"><strong>Paciente:</strong> ' . e($evolution->patient->name ?? 'N/A') . ' &nbsp; | &nbsp; ';
        $html .= '<strong>Data:</strong> ' . $date . ' &nbsp; | &nbsp; ';
        $html .= '<strong>Tipo:</strong> ' . $tipo . '</p>';
        $html .= '</div>';

        // S - Subjetivo
        $html .= '<h2>S — Subjetivo</h2>';
        if ($evolution->queixa_principal) $html .= '<div class="field"><div class="field-label">Queixa Principal</div><div class="field-value">' . e($evolution->queixa_principal) . '</div></div>';
        if ($evolution->relato_paciente) $html .= '<div class="field"><div class="field-label">Relato do Paciente</div><div class="field-value">' . e($evolution->relato_paciente) . '</div></div>';
        if ($evolution->dor_eva !== null) $html .= '<div class="field"><div class="field-label">EVA da Dor</div><div class="field-value">' . $evolution->dor_eva . '/10</div></div>';
        if ($evolution->localizacao_dor) $html .= '<div class="field"><div class="field-label">Localização</div><div class="field-value">' . e($evolution->localizacao_dor) . '</div></div>';
        if ($evolution->tipo_dor) $html .= '<div class="field"><div class="field-label">Tipo de Dor</div><div class="field-value">' . e($evolution->tipo_dor) . '</div></div>';

        // O - Objetivo
        $html .= '<h2>O — Objetivo</h2>';
        $vitals = [];
        if ($evolution->pressao_arterial) $vitals[] = '<strong>PA:</strong> ' . e($evolution->pressao_arterial);
        if ($evolution->frequencia_cardiaca) $vitals[] = '<strong>FC:</strong> ' . e($evolution->frequencia_cardiaca);
        if ($evolution->saturacao) $vitals[] = '<strong>SpO2:</strong> ' . e($evolution->saturacao);
        if (!empty($vitals)) $html .= '<p>' . implode(' &nbsp; | &nbsp; ', $vitals) . '</p>';
        if ($evolution->condutas_realizadas) $html .= '<div class="field"><div class="field-label">Condutas Realizadas</div><div class="field-value">' . nl2br(e($evolution->condutas_realizadas)) . '</div></div>';

        // A - Avaliação
        $html .= '<h2>A — Avaliação</h2>';
        if ($evolution->analise_profissional) $html .= '<div class="field"><div class="field-label">Análise Profissional</div><div class="field-value">' . nl2br(e($evolution->analise_profissional)) . '</div></div>';
        if ($evolution->resposta_tratamento) $html .= '<div class="field"><div class="field-label">Resposta ao Tratamento</div><div class="field-value">' . nl2br(e($evolution->resposta_tratamento)) . '</div></div>';

        // P - Plano
        $html .= '<h2>P — Plano</h2>';
        if ($evolution->conduta_planejada) $html .= '<div class="field"><div class="field-label">Conduta Planejada</div><div class="field-value">' . nl2br(e($evolution->conduta_planejada)) . '</div></div>';
        if ($evolution->orientacoes_domiciliares) $html .= '<div class="field"><div class="field-label">Orientações Domiciliares</div><div class="field-value">' . nl2br(e($evolution->orientacoes_domiciliares)) . '</div></div>';

        $html .= '<div class="footer">Phisio &mdash; Gerado em ' . now()->format('d/m/Y H:i') . '</div>';
        $html .= '</body></html>';

        $filename = 'evolucao_' . ($evolution->patient->name ?? 'paciente') . '_' . \Str::slug($date) . '.pdf';

        return Pdf::loadHTML($html)->download($filename);
    }
}
