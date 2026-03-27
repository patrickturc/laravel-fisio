import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface TreatmentPlan {
    id: string;
    patient_id: string;
    title: string;
    objective: string | null;
    total_sessions: number;
    completed_sessions: number;
    status: string;
    start_date: string;
    end_date: string | null;
    notes: string | null;
}

export default function TreatmentPlanEdit({ plan, patients }: { plan: TreatmentPlan; patients: { id: string; name: string }[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planos de Tratamento', href: '/treatment-plans' },
        { title: plan.title, href: `/treatment-plans/${plan.id}` },
        { title: 'Editar', href: `/treatment-plans/${plan.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        patient_id: plan.patient_id,
        title: plan.title,
        objective: plan.objective || '',
        total_sessions: plan.total_sessions,
        completed_sessions: plan.completed_sessions,
        status: plan.status,
        start_date: plan.start_date?.slice(0, 10) || '',
        end_date: plan.end_date?.slice(0, 10) || '',
        notes: plan.notes || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/treatment-plans/${plan.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar - ${plan.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href={`/treatment-plans/${plan.id}`} className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Plano</h1>
                </div>

                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Paciente *</label>
                            <select value={data.patient_id} onChange={e => setData('patient_id', e.target.value)}
                                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm">
                                <option value="">Selecione...</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {errors.patient_id && <p className="text-xs text-red-500 mt-1">{errors.patient_id}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Título *</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Objetivo</label>
                        <textarea value={data.objective} onChange={e => setData('objective', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Total de Sessões *</label>
                            <input type="number" value={data.total_sessions} onChange={e => setData('total_sessions', parseInt(e.target.value) || 0)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Sessões Realizadas</label>
                            <input type="number" value={data.completed_sessions} onChange={e => setData('completed_sessions', parseInt(e.target.value) || 0)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Data Início *</label>
                            <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Data Fim</label>
                            <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)}
                            className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm">
                            <option value="active">Ativo</option>
                            <option value="paused">Pausado</option>
                            <option value="completed">Concluído</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Observações</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing}
                            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                            Salvar Alterações
                        </button>
                    </div>
                </motion.form>
            </div>
        </AppLayout>
    );
}
