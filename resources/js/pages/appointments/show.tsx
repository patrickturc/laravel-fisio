import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, Clock, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';

interface Appointment {
    id: string;
    patient_id: string;
    appointment_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    notes: string | null;
    patient: { id: string; name: string; type: string };
}

export default function AppointmentShow({ appointment }: { appointment: Appointment }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agenda', href: '/appointments' },
        { title: `${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}`, href: `/appointments/${appointment.id}` },
    ];

    const { confirm, modal } = useConfirmModal();

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Agendamento',
            message: 'Tem certeza que deseja excluir este agendamento?',
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/appointments/${appointment.id}`);
    }

    const statusLabel: Record<string, string> = { scheduled: 'Agendado', completed: 'Realizado', cancelled: 'Cancelado' };
    const statusColor: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalhes do Agendamento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/appointments" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"><ArrowLeft className="size-5" /></Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Detalhes do Agendamento</h1>
                            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${statusColor[appointment.status]}`}>{statusLabel[appointment.status]}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/appointments/${appointment.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><Edit className="size-4" /></Link>
                        <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><User className="size-4" /></div>
                        <div><p className="text-xs text-muted-foreground">Paciente</p><Link href={`/patients/${appointment.patient.id}`} className="font-semibold text-sm text-primary hover:underline">{appointment.patient.name}</Link></div>
                    </div>
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600"><Clock className="size-4" /></div>
                        <div><p className="text-xs text-muted-foreground">Data e Horário</p><p className="font-semibold text-sm">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.start_time?.slice(0, 5)} ({appointment.duration_minutes}min)</p></div>
                    </div>
                </motion.div>

                {appointment.notes && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><FileText className="size-5 text-primary" /> Observações</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
                    </motion.div>
                )}
            </div>
            {modal}
        </AppLayout>
    );
}
