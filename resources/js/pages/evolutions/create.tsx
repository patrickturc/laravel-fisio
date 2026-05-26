import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Evoluções', href: '/evolutions' },
    { title: 'Nova Evolução', href: '/evolutions/create' },
];

interface Props {
    patients: Array<{ id: string; name: string; type: string }>;
    selectedPatientId?: string | null;
    selectedAppointmentId?: string | null;
    selectedTreatmentPlanId?: string | null;
    activePlans?: Array<{ id: string; title: string; total_sessions: number; completed_sessions: number }>;
}

export default function EvolutionCreate({ patients, selectedPatientId, selectedAppointmentId, selectedTreatmentPlanId, activePlans = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        paciente_id: selectedPatientId || '',
        agendamento_id: selectedAppointmentId || '',
        treatment_plan_id: selectedTreatmentPlanId || '',
        data_atendimento: new Date().toISOString().split('T')[0],
        tipo_atendimento: 'sessao',
        queixa_principal: '',
        relato_paciente: '',
        dor_eva: '',
        localizacao_dor: '',
        tipo_dor: '',
        pressao_arterial: '',
        frequencia_cardiaca: '',
        saturacao: '',
        amplitude_movimento: '',
        forca_muscular: '',
        avaliacao_funcional: '',
        avaliacao_postural: '',
        condutas_realizadas: '',
        parametros_conduta: '',
        resposta_tratamento: '',
        evolucao_status: '',
        analise_profissional: '',
        conduta_planejada: '',
        orientacoes_domiciliares: '',
    });

    const [plans, setPlans] = useState<Array<{ id: string; title: string; total_sessions: number; completed_sessions: number }>>(activePlans);

    function handlePatientChange(patientId: string) {
        setData('paciente_id', patientId);
        setData('treatment_plan_id', '');
        if (patientId) {
            // Reload page with new patient to get their plans
            router.get('/evolutions/create', { paciente_id: patientId }, { preserveState: false });
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/evolutions');
    }

    const selectedPlan = plans.find(p => p.id === data.treatment_plan_id);

    const textareaClass = "flex w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px] resize-y";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Evolução" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/evolutions" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"><ArrowLeft className="size-5" /></Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nova Evolução (SOAP)</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Registre a evolução clínica do paciente.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Identification */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-lg font-bold text-foreground">Identificação</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="paciente_id">Paciente *</Label>
                                <select id="paciente_id" value={data.paciente_id} onChange={e => handlePatientChange(e.target.value)} className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                                    <option value="">Selecionar</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <InputError message={errors.paciente_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="data_atendimento">Data *</Label>
                                <Input id="data_atendimento" type="date" value={data.data_atendimento} onChange={e => setData('data_atendimento', e.target.value)} className="bg-neutral-50 border-neutral-200" required />
                                <InputError message={errors.data_atendimento} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tipo_atendimento">Tipo *</Label>
                                <select id="tipo_atendimento" value={data.tipo_atendimento} onChange={e => setData('tipo_atendimento', e.target.value)} className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="sessao">Sessão</option>
                                    <option value="avaliacao">Avaliação</option>
                                    <option value="reavaliacao">Reavaliação</option>
                                </select>
                            </div>
                        </div>

                        {/* Treatment Plan Selection */}
                        {plans.length > 0 && (
                            <div className="grid gap-2 pt-2 border-t border-border/30">
                                <Label htmlFor="treatment_plan_id">Plano de Tratamento</Label>
                                <select id="treatment_plan_id" value={data.treatment_plan_id} onChange={e => setData('treatment_plan_id', e.target.value)} className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="">Nenhum (evolução avulsa)</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} — {p.completed_sessions}/{p.total_sessions} sessões
                                        </option>
                                    ))}
                                </select>
                                {selectedPlan && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                                        <div className="flex-1">
                                            <span className="font-semibold text-foreground">{selectedPlan.title}</span>
                                            <span className="text-muted-foreground ml-2">
                                                {selectedPlan.completed_sessions} de {selectedPlan.total_sessions} sessões realizadas
                                            </span>
                                        </div>
                                        <span className="text-primary font-bold">
                                            {Math.round((selectedPlan.completed_sessions / selectedPlan.total_sessions) * 100)}%
                                        </span>
                                    </div>
                                )}
                                <InputError message={errors.treatment_plan_id} />
                            </div>
                        )}
                    </div>

                    {/* S - Subjetivo */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-lg font-bold text-foreground"><span className="text-primary mr-1">S</span> — Subjetivo</h2>
                        <div className="grid gap-2">
                            <Label>Queixa principal</Label>
                            <textarea value={data.queixa_principal} onChange={e => setData('queixa_principal', e.target.value)} className={textareaClass} placeholder="Descreva a queixa do paciente..." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Relato do paciente</Label>
                            <textarea value={data.relato_paciente} onChange={e => setData('relato_paciente', e.target.value)} className={textareaClass} placeholder="O que o paciente relatou..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label>EVA da Dor (0-10)</Label>
                                <Input type="number" value={data.dor_eva} onChange={e => setData('dor_eva', e.target.value)} className="bg-neutral-50 border-neutral-200" min="0" max="10" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Localização da dor</Label>
                                <Input value={data.localizacao_dor} onChange={e => setData('localizacao_dor', e.target.value)} className="bg-neutral-50 border-neutral-200" placeholder="Ex: lombar, cervical" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo de dor</Label>
                                <Input value={data.tipo_dor} onChange={e => setData('tipo_dor', e.target.value)} className="bg-neutral-50 border-neutral-200" placeholder="Ex: aguda, crônica" />
                            </div>
                        </div>
                    </div>

                    {/* O - Objetivo */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-lg font-bold text-foreground"><span className="text-emerald-600 mr-1">O</span> — Objetivo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2"><Label>PA</Label><Input value={data.pressao_arterial} onChange={e => setData('pressao_arterial', e.target.value)} className="bg-neutral-50 border-neutral-200" placeholder="120/80" /></div>
                            <div className="grid gap-2"><Label>FC</Label><Input value={data.frequencia_cardiaca} onChange={e => setData('frequencia_cardiaca', e.target.value)} className="bg-neutral-50 border-neutral-200" placeholder="72 bpm" /></div>
                            <div className="grid gap-2"><Label>SpO2</Label><Input value={data.saturacao} onChange={e => setData('saturacao', e.target.value)} className="bg-neutral-50 border-neutral-200" placeholder="98%" /></div>
                        </div>
                        <div className="grid gap-2"><Label>Condutas Realizadas</Label><textarea value={data.condutas_realizadas} onChange={e => setData('condutas_realizadas', e.target.value)} className={textareaClass} placeholder="Descreva condutas, exercícios realizados..." /></div>
                    </div>

                    {/* A - Avaliação */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-lg font-bold text-foreground"><span className="text-amber-600 mr-1">A</span> — Avaliação</h2>
                        <div className="grid gap-2"><Label>Análise do Profissional</Label><textarea value={data.analise_profissional} onChange={e => setData('analise_profissional', e.target.value)} className={textareaClass} placeholder="Sua análise sobre a evolução do quadro..." /></div>
                        <div className="grid gap-2"><Label>Resposta ao Tratamento</Label><textarea value={data.resposta_tratamento} onChange={e => setData('resposta_tratamento', e.target.value)} className={textareaClass} placeholder="Como o paciente respondeu à sessão..." /></div>
                    </div>

                    {/* P - Plano */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
                        <h2 className="text-lg font-bold text-foreground"><span className="text-indigo-600 mr-1">P</span> — Plano</h2>
                        <div className="grid gap-2"><Label>Conduta Planejada</Label><textarea value={data.conduta_planejada} onChange={e => setData('conduta_planejada', e.target.value)} className={textareaClass} placeholder="Plano para as próximas sessões..." /></div>
                        <div className="grid gap-2"><Label>Orientações Domiciliares</Label><textarea value={data.orientacoes_domiciliares} onChange={e => setData('orientacoes_domiciliares', e.target.value)} className={textareaClass} placeholder="Exercícios e orientações para casa..." /></div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-2 pb-8">
                        <Link href="/evolutions" className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Cancelar</Link>
                        <Button type="submit" disabled={processing} className="px-8 py-3 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 text-base font-semibold">
                            {processing ? 'Salvando...' : 'Registrar Evolução'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
