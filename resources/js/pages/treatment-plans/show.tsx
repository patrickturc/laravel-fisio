import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, Target, Calendar, User, Plus, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';

interface TreatmentPlan {
    id: string;
    title: string;
    objective: string | null;
    total_sessions: number;
    completed_sessions: number;
    status: string;
    start_date: string;
    end_date: string | null;
    notes: string | null;
    patient: { id: string; name: string; type: string } | null;
    evolutions?: Array<{
        id: string;
        data_atendimento: string;
        tipo_atendimento: string;
        condutas_realizadas: string | null;
        queixa_principal: string | null;
    }>;
}

export default function TreatmentPlanShow({ plan }: { plan: TreatmentPlan }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planos de Tratamento', href: '/treatment-plans' },
        { title: plan.title, href: `/treatment-plans/${plan.id}` },
    ];

    const { confirm, modal } = useConfirmModal();

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Plano',
            message: 'Tem certeza que deseja excluir este plano de tratamento?',
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/treatment-plans/${plan.id}`);
    }

    const pct = plan.total_sessions > 0 ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) : 0;
    const statusLabels: Record<string, string> = { active: 'Ativo', paused: 'Pausado', completed: 'Concluído' };
    const statusColors: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    const tipoLabels: Record<string, string> = { sessao: 'Sessão', avaliacao: 'Avaliação', reavaliacao: 'Reavaliação' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={plan.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/treatment-plans" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{plan.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[plan.status]}`}>
                                    {statusLabels[plan.status]}
                                </span>
                                {plan.patient && <span className="text-sm text-muted-foreground flex items-center gap-1"><User className="size-3" /> {plan.patient.name}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/treatment-plans/${plan.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><Edit className="size-4" /></Link>
                        <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                </div>

                {/* Progress card */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Target className="size-5 text-primary" /> Progresso</h2>
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-sm font-medium">{plan.completed_sessions} de {plan.total_sessions} sessões</span>
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">{pct}%</span>
                    </div>
                    <div className="w-full h-4 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`} />
                    </div>

                    {/* Register new session */}
                    {plan.status === 'active' && plan.patient && (
                        <Link
                            href={`/evolutions/create?paciente_id=${plan.patient.id}&treatment_plan_id=${plan.id}`}
                            className="mt-4 flex items-center justify-center gap-2 w-full p-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm text-sm"
                        >
                            <Plus className="size-4" />
                            Registrar Sessão
                        </Link>
                    )}
                </motion.div>

                {/* Session History */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-emerald-500" />
                        Histórico de Sessões
                    </h2>

                    {plan.evolutions && plan.evolutions.length > 0 ? (
                        <div className="space-y-3">
                            {plan.evolutions.map((evo, i) => (
                                <Link key={evo.id} href={`/evolutions/${evo.id}`}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                                        {plan.evolutions!.length - i}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {new Date(evo.data_atendimento).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                                {tipoLabels[evo.tipo_atendimento] || evo.tipo_atendimento}
                                            </span>
                                        </div>
                                        {evo.condutas_realizadas && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{evo.condutas_realizadas}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhuma sessão registrada ainda.</p>
                            {plan.status === 'active' && plan.patient && (
                                <Link href={`/evolutions/create?paciente_id=${plan.patient.id}&treatment_plan_id=${plan.id}`}
                                    className="text-primary text-sm font-semibold hover:text-primary/80 mt-2 inline-block">
                                    Registrar primeira sessão →
                                </Link>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.objective && (
                        <div className="bg-card/60 border border-border/50 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Objetivo</h3>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{plan.objective}</p>
                        </div>
                    )}
                    <div className="bg-card/60 border border-border/50 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Datas</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2"><Calendar className="size-4 text-primary" /> <span className="text-muted-foreground">Início:</span> <span className="font-medium">{new Date(plan.start_date).toLocaleDateString('pt-BR')}</span></div>
                            {plan.end_date && <div className="flex items-center gap-2"><Calendar className="size-4 text-emerald-500" /> <span className="text-muted-foreground">Fim previsto:</span> <span className="font-medium">{new Date(plan.end_date).toLocaleDateString('pt-BR')}</span></div>}
                        </div>
                    </div>
                </div>

                {plan.notes && (
                    <div className="bg-card/60 border border-border/50 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Observações</h3>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{plan.notes}</p>
                    </div>
                )}
            </div>
            {modal}
        </AppLayout>
    );
}
