import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';
import { usePermissions } from '@/hooks/use-permissions';

interface ClinicalProtocol {
    id: string;
    name: string;
    description: string | null;
    total_sessions: number | null;
    notes: string | null;
    evolutions?: Array<{
        id: string;
        data_atendimento: string;
        tipo_atendimento: string;
        condutas_realizadas: string | null;
        patient?: { id: string; name: string };
    }>;
}

export default function ClinicalProtocolShow({ protocol }: { protocol: ClinicalProtocol }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Protocolos Clínicos', href: '/clinical-protocols' },
        { title: protocol.name, href: `/clinical-protocols/${protocol.id}` },
    ];

    const { can } = usePermissions();
    const { confirm, modal } = useConfirmModal();

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Protocolo',
            message: 'Tem certeza que deseja excluir este protocolo clínico?',
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/clinical-protocols/${protocol.id}`);
    }

    const tipoLabels: Record<string, string> = { sessao: 'Sessão', avaliacao: 'Avaliação', reavaliacao: 'Reavaliação' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={protocol.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/clinical-protocols" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{protocol.name}</h1>
                            {protocol.total_sessions && (
                                <p className="text-sm font-medium text-emerald-600 mt-1">{protocol.total_sessions} sessões sugeridas</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('treatment_plans.manage.edit') && (
                            <Link href={`/clinical-protocols/${protocol.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><Edit className="size-4" /></Link>
                        )}
                        {can('treatment_plans.manage.delete') && (
                            <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="size-4" /></button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {protocol.description && (
                        <div className="bg-card/60 border border-border/50 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Descrição / Objetivo Geral</h3>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{protocol.description}</p>
                        </div>
                    )}
                    {protocol.notes && (
                        <div className="bg-card/60 border border-border/50 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Observações Técnicas</h3>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{protocol.notes}</p>
                        </div>
                    )}
                </div>

                {/* Session History */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-emerald-500" />
                        Evoluções que utilizaram este protocolo
                    </h2>

                    {protocol.evolutions && protocol.evolutions.length > 0 ? (
                        <div className="space-y-3">
                            {protocol.evolutions.map((evo) => (
                                <Link key={evo.id} href={`/evolutions/${evo.id}`}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors group">
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-foreground">
                                                {evo.patient?.name || 'Paciente'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                • {new Date(evo.data_atendimento).toLocaleDateString('pt-BR')}
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
                            <p className="text-sm text-muted-foreground">Nenhuma evolução registrada com este protocolo ainda.</p>
                        </div>
                    )}
                </motion.div>

            </div>
            {modal}
        </AppLayout>
    );
}
