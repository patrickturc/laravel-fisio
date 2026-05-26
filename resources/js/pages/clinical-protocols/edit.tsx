import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClinicalProtocol {
    id: string;
    name: string;
    description: string | null;
    total_sessions: number | null;
    notes: string | null;
}

export default function ClinicalProtocolEdit({ protocol }: { protocol: ClinicalProtocol }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Protocolos Clínicos', href: '/clinical-protocols' },
        { title: protocol.name, href: `/clinical-protocols/${protocol.id}` },
        { title: 'Editar', href: `/clinical-protocols/${protocol.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: protocol.name,
        description: protocol.description || '',
        total_sessions: protocol.total_sessions || '',
        notes: protocol.notes || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/clinical-protocols/${protocol.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar - ${protocol.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href={`/clinical-protocols/${protocol.id}`} className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Protocolo</h1>
                </div>

                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-sm space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do Protocolo *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição / Objetivo Geral</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Total de Sessões Padrão</label>
                            <input type="number" value={data.total_sessions} onChange={e => setData('total_sessions', e.target.value)} min={1}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" placeholder="Opcional. Ex: 10" />
                            {errors.total_sessions && <p className="text-xs text-red-500 mt-1">{errors.total_sessions}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Observações Adicionais</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none" />
                        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
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
