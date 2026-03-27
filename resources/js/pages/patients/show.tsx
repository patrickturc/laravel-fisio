import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Phone, MapPin, Edit, Trash2, Calendar, FileText, Cake, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';

interface Patient {
    id: string;
    name: string;
    phone: string | null;
    type: 'pilates' | 'physiotherapy';
    cpf: string | null;
    address: string | null;
    birthdate: string | null;
    appointments: Array<{
        id: string;
        appointment_date: string;
        start_time: string;
        duration_minutes: number;
        status: string;
        notes: string | null;
    }>;
    evolutions: Array<{
        id: string;
        data_atendimento: string;
        tipo_atendimento: string;
        queixa_principal: string | null;
        condutas_realizadas: string | null;
    }>;
}

interface TimelineItem {
    id: string;
    date: string;
    type: 'appointment' | 'evolution';
    data: any;
}

export default function PatientShow({ patient }: { patient: Patient }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pacientes', href: '/patients' },
        { title: patient.name, href: `/patients/${patient.id}` },
    ];

    const { confirm, modal } = useConfirmModal();

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Paciente',
            message: `Tem certeza que deseja excluir "${patient.name}"? Essa ação não pode ser desfeita.`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/patients/${patient.id}`);
    }

    // Build timeline from appointments + evolutions
    const timeline: TimelineItem[] = [
        ...patient.appointments.map(a => ({
            id: `app-${a.id}`,
            date: a.appointment_date,
            type: 'appointment' as const,
            data: a,
        })),
        ...patient.evolutions.map(e => ({
            id: `evo-${e.id}`,
            date: e.data_atendimento,
            type: 'evolution' as const,
            data: e,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const statusLabel: Record<string, string> = { scheduled: 'Agendado', completed: 'Realizado', cancelled: 'Cancelado' };
    const statusColor: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    const tipoLabel: Record<string, string> = { avaliacao: 'Avaliação', reavaliacao: 'Reavaliação', sessao: 'Sessão' };

    const age = patient.birthdate
        ? Math.floor((new Date().getTime() - new Date(patient.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={patient.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/patients" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${patient.type === 'pilates' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {patient.type === 'pilates' ? 'Pilates' : 'Fisioterapia'}
                                </span>
                                {age !== null && (
                                    <span className="text-sm text-muted-foreground">{age} anos</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/patients/${patient.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Edit className="size-4" />
                        </Link>
                        <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {patient.phone && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-semibold text-sm">{patient.phone}</p></div>
                        </div>
                    )}
                    {patient.cpf && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><FileText className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">CPF</p><p className="font-semibold text-sm">{patient.cpf}</p></div>
                        </div>
                    )}
                    {patient.address && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><MapPin className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-semibold text-sm">{patient.address}</p></div>
                        </div>
                    )}
                    {patient.birthdate && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-600"><Cake className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">Nascimento</p><p className="font-semibold text-sm">{new Date(patient.birthdate).toLocaleDateString('pt-BR')}</p></div>
                        </div>
                    )}
                </div>

                {/* Quick actions */}
                <div className="flex gap-3">
                    <Link href={`/appointments/create?patient_id=${patient.id}`} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                        <Calendar className="size-4" /> Novo Agendamento
                    </Link>
                    <Link href={`/evolutions/create?paciente_id=${patient.id}`} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-500/20 transition-colors">
                        <Activity className="size-4" /> Nova Evolução
                    </Link>
                </div>

                {/* Timeline */}
                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Clock className="size-5 text-primary" /> Prontuário Completo
                        <span className="text-sm font-normal text-muted-foreground ml-2">({timeline.length} registros)</span>
                    </h2>

                    {timeline.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum registro encontrado.</p>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border/50" />

                            <div className="space-y-1">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        key={item.id}
                                        className="relative flex gap-4 pl-10 py-3 hover:bg-muted/20 rounded-xl transition-colors group"
                                    >
                                        {/* Dot */}
                                        <div className={`absolute left-2.5 top-5 size-3 rounded-full border-2 border-background ${
                                            item.type === 'appointment' ? 'bg-emerald-500' : 'bg-indigo-500'
                                        }`} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </span>
                                                {item.type === 'appointment' ? (
                                                    <>
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            Agendamento
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${statusColor[item.data.status]}`}>
                                                            {statusLabel[item.data.status]}
                                                        </span>
                                                        {item.data.start_time && (
                                                            <span className="text-xs text-muted-foreground">{item.data.start_time.slice(0,5)} • {item.data.duration_minutes}min</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        {tipoLabel[item.data.tipo_atendimento] || item.data.tipo_atendimento}
                                                    </span>
                                                )}
                                            </div>
                                            {item.type === 'appointment' && item.data.notes && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">{item.data.notes}</p>
                                            )}
                                            {item.type === 'evolution' && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {item.data.queixa_principal || item.data.condutas_realizadas || 'Sem detalhes'}
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href={item.type === 'appointment' ? `/appointments/${item.data.id}` : `/evolutions/${item.data.id}`}
                                            className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center"
                                        >
                                            Ver →
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {modal}
        </AppLayout>
    );
}
