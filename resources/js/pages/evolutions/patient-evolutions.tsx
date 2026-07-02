import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Activity, Plus, Calendar as CalendarIcon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import EvolutionFormSheet from '@/components/EvolutionFormSheet';
import { usePermissions } from '@/hooks/use-permissions';

const tipoLabel: Record<string, string> = {
    avaliacao: 'Avaliação',
    reavaliacao: 'Reavaliação',
    sessao: 'Sessão',
    simple: 'Evolução Rápida',
};

export default function PatientEvolutions({ patient, evolutions, protocols = [] }: { patient: any, evolutions: any[], protocols?: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evoluções', href: '/evolutions' },
        { title: `Evoluções de ${patient.name}`, href: `/evolutions/patient/${patient.id}` },
    ];

    const { can } = usePermissions();
    const [isEvolutionSheetOpen, setIsEvolutionSheetOpen] = useState(false);
    const [editingEvolution, setEditingEvolution] = useState<any>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Evoluções - ${patient.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/evolutions" className="p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <User className="size-6 text-primary" />
                                {patient.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">Histórico completo de evoluções e avaliações do paciente.</p>
                        </div>
                    </div>

                    {can('evolutions.manage.create') && (
                        <button
                            onClick={() => { setEditingEvolution(null); setIsEvolutionSheetOpen(true); }}
                            className="flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus className="size-4" /> Nova Evolução
                        </button>
                    )}
                </div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="size-5 text-primary" /> Prontuário
                                <span className="text-sm font-normal text-muted-foreground ml-2">({evolutions.length} registros)</span>
                            </h2>
                        </div>

                        {evolutions.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                <Activity className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground font-medium">Nenhuma evolução registrada.</p>
                                <p className="text-xs text-muted-foreground mt-1">O histórico clínico do paciente aparecerá aqui.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border/50" />
                                <div className="space-y-1">
                                    {evolutions.map((evo, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            key={evo.id}
                                            className="relative flex gap-4 pl-10 py-3 hover:bg-muted/20 rounded-xl transition-colors group"
                                        >
                                            <div className="absolute left-2.5 top-5 size-3 rounded-full border-2 border-background bg-indigo-500" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                        <CalendarIcon className="size-3" />
                                                        {new Date(evo.data_atendimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                                                        evo.tipo_atendimento === 'avaliacao' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                        evo.tipo_atendimento === 'reavaliacao' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    }`}>
                                                        {tipoLabel[evo.tipo_atendimento] || evo.tipo_atendimento}
                                                    </span>
                                                    {evo.dor_eva !== null && evo.dor_eva !== undefined && (
                                                        <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-md border border-destructive/20">
                                                            Dor EVA: {evo.dor_eva}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-foreground space-y-1 mt-2">
                                                    {evo.observacoes ? (
                                                        <p><strong>Resumo:</strong> {evo.observacoes}</p>
                                                    ) : (
                                                        <>
                                                            {evo.queixa_principal && <p><strong>Subjetivo:</strong> {evo.queixa_principal}</p>}
                                                            {evo.condutas_realizadas && <p><strong>Objetivo (Condutas):</strong> {evo.condutas_realizadas}</p>}
                                                            {evo.analise_profissional && <p><strong>Análise:</strong> {evo.analise_profissional}</p>}
                                                            {evo.conduta_planejada && <p><strong>Plano:</strong> {evo.conduta_planejada}</p>}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 self-center items-end">
                                                <Link href={`/evolutions/${evo.id}`} className="text-xs font-medium text-primary hover:underline">Detalhes completos →</Link>
                                                {can('evolutions.manage.edit') && (
                                                    <button onClick={() => { setEditingEvolution(evo); setIsEvolutionSheetOpen(true); }} className="text-xs font-medium text-muted-foreground hover:text-foreground">Editar</button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <EvolutionFormSheet
                isOpen={isEvolutionSheetOpen}
                onOpenChange={setIsEvolutionSheetOpen}
                evolution={editingEvolution}
                patients={[patient]}
                protocols={protocols}
                patientId={patient.id}
            />
        </AppLayout>
    );
}
