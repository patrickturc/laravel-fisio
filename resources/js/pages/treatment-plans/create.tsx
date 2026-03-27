import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Planos de Tratamento', href: '/treatment-plans' },
    { title: 'Novo', href: '/treatment-plans/create' },
];

export default function TreatmentPlanCreate({ patients }: { patients: { id: string; name: string }[] }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        title: '',
        objective: '',
        total_sessions: 10,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/treatment-plans');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Plano de Tratamento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/treatment-plans" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Plano de Tratamento</h1>
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
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" placeholder="Ex: Reabilitação pós-operatória" />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Objetivo</label>
                        <textarea value={data.objective} onChange={e => setData('objective', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" placeholder="Descreva o objetivo do tratamento..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Total de Sessões *</label>
                            <input type="number" value={data.total_sessions} onChange={e => setData('total_sessions', parseInt(e.target.value) || 0)} min={1}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                            {errors.total_sessions && <p className="text-xs text-red-500 mt-1">{errors.total_sessions}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Data Início *</label>
                            <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Data Fim (prevista)</label>
                            <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Observações</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing}
                            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                            Criar Plano
                        </button>
                    </div>
                </motion.form>
            </div>
        </AppLayout>
    );
}
