import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';

interface Evolution {
    id: string;
    paciente_id: string;
    data_atendimento: string;
    tipo_atendimento: string;
    queixa_principal: string | null;
    relato_paciente: string | null;
    dor_eva: number | null;
    localizacao_dor: string | null;
    tipo_dor: string | null;
    pressao_arterial: string | null;
    frequencia_cardiaca: string | null;
    saturacao: string | null;
    condutas_realizadas: string | null;
    analise_profissional: string | null;
    resposta_tratamento: string | null;
    conduta_planejada: string | null;
    orientacoes_domiciliares: string | null;
    patient: { id: string; name: string; type: string };
    professional?: { id: string; name: string } | null;
}

export default function EvolutionShow({ evolution }: { evolution: Evolution }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evoluções', href: '/evolutions' },
        { title: new Date(evolution.data_atendimento).toLocaleDateString('pt-BR'), href: `/evolutions/${evolution.id}` },
    ];

    const { confirm, modal } = useConfirmModal();

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Evolução',
            message: 'Tem certeza que deseja excluir esta evolução?',
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/evolutions/${evolution.id}`);
    }

    const tipoLabel: Record<string, string> = { avaliacao: 'Avaliação', reavaliacao: 'Reavaliação', sessao: 'Sessão' };
    const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-bold"><span className={`${color} mr-1`}>{title.charAt(0)}</span> — {title}</h2>
            {children}
        </motion.div>
    );
    const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) =>
        value ? <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p><p className="text-sm whitespace-pre-wrap">{value}</p></div> : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evolução" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/evolutions" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"><ArrowLeft className="size-5" /></Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Evolução - {evolution.patient.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">{new Date(evolution.data_atendimento).toLocaleDateString('pt-BR')}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{tipoLabel[evolution.tipo_atendimento] || evolution.tipo_atendimento}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={`/evolutions/${evolution.id}/pdf`} target="_blank" className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Exportar PDF">
                            <Download className="size-4" />
                        </a>
                        <Link href={`/evolutions/${evolution.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><Edit className="size-4" /></Link>
                        <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                </div>

                <Section title="Subjetivo" color="text-primary">
                    <Field label="Queixa Principal" value={evolution.queixa_principal} />
                    <Field label="Relato do Paciente" value={evolution.relato_paciente} />
                    {evolution.dor_eva != null && <Field label="EVA da Dor" value={`${evolution.dor_eva}/10`} />}
                    <Field label="Localização" value={evolution.localizacao_dor} />
                    <Field label="Tipo de Dor" value={evolution.tipo_dor} />
                </Section>

                <Section title="Objetivo" color="text-emerald-600">
                    <div className="flex flex-wrap gap-4">
                        {evolution.pressao_arterial && <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/20"><p className="text-xs text-muted-foreground">PA</p><p className="font-semibold text-sm">{evolution.pressao_arterial}</p></div>}
                        {evolution.frequencia_cardiaca && <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/20"><p className="text-xs text-muted-foreground">FC</p><p className="font-semibold text-sm">{evolution.frequencia_cardiaca}</p></div>}
                        {evolution.saturacao && <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/20"><p className="text-xs text-muted-foreground">SpO2</p><p className="font-semibold text-sm">{evolution.saturacao}</p></div>}
                    </div>
                    <Field label="Condutas Realizadas" value={evolution.condutas_realizadas} />
                </Section>

                <Section title="Avaliação" color="text-amber-600">
                    <Field label="Análise Profissional" value={evolution.analise_profissional} />
                    <Field label="Resposta ao Tratamento" value={evolution.resposta_tratamento} />
                </Section>

                <Section title="Plano" color="text-indigo-600">
                    <Field label="Conduta Planejada" value={evolution.conduta_planejada} />
                    <Field label="Orientações Domiciliares" value={evolution.orientacoes_domiciliares} />
                </Section>
            </div>
            {modal}
        </AppLayout>
    );
}
