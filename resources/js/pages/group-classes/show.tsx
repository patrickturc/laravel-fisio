import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Users, ArrowLeft, Calendar, User, Clock, Settings, Plus, PlayCircle, Trash2, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';
import { Pagination } from '@/components/pagination';
import { useForm } from '@inertiajs/react';
import { GroupClassFormSheet } from './group-class-form-sheet';

export default function GroupClassShow({ groupClass, futureAppointments = [], patients }: { groupClass: any, futureAppointments?: any[], patients: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turmas', href: '/group-classes' },
        { title: groupClass.name, href: `/group-classes/${groupClass.id}` },
    ];

    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const { confirm, modal } = useConfirmModal();

    const { post, processing: generating } = useForm({
        weeks: 4,
        start_date: new Date().toISOString().split('T')[0]
    });

    async function handleGenerateAppointments() {
        const confirmed = await confirm({
            title: 'Gerar Aulas (Agendamentos)',
            message: `Isso irá gerar os agendamentos reais na sua agenda para as próximas 4 semanas (1 mês), com base nos horários da turma. Deseja continuar?`,
            confirmLabel: 'Gerar Aulas',
        });
        if (confirmed) {
            post(`/group-classes/${groupClass.id}/generate-appointments`);
        }
    }

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Turma',
            message: `Tem certeza que deseja excluir a turma "${groupClass.name}"? Essa ação não excluirá os agendamentos já criados.`,
            confirmLabel: 'Excluir Turma',
        });
        if (confirmed) router.delete(`/group-classes/${groupClass.id}`);
    }

    const formatDays = (schedules: any[]) => {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        if (!schedules || schedules.length === 0) return 'Sem horário definido';
        
        return schedules.map(s => `${days[s.day_of_week]} às ${s.start_time.substring(0, 5)} (${s.duration_minutes}min)`).join(', ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={groupClass.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Link href="/group-classes" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
                                <Users className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{groupClass.name}</h1>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        groupClass.status === 'active' 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {groupClass.status === 'active' ? 'Ativa' : 'Inativa'}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {groupClass.patients?.length || 0} de {groupClass.max_participants} alunos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/50" onClick={handleDelete}>
                            <Trash2 className="size-4" /> Excluir
                        </Button>
                        <Button className="gap-2 rounded-xl shadow-sm" onClick={() => setIsEditSheetOpen(true)}>
                            <Settings className="size-4" /> Editar Turma
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Info & Alunos */}
                    <div className="space-y-6 lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                        >
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <Clock className="size-5 text-primary" /> Horários
                            </h2>
                            <div className="space-y-3">
                                {groupClass.schedules?.length > 0 ? (
                                    groupClass.schedules.map((schedule: any) => {
                                        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                                        return (
                                            <div key={schedule.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                        {days[schedule.day_of_week].substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{days[schedule.day_of_week]}</p>
                                                        <p className="text-xs text-muted-foreground">{schedule.start_time.substring(0, 5)} • {schedule.duration_minutes}min</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum horário definido.</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <User className="size-5 text-primary" /> Alunos Fixos
                                </h2>
                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-muted">
                                    {groupClass.patients?.length || 0} / {groupClass.max_participants}
                                </span>
                            </div>
                            
                            <div className="space-y-2">
                                {groupClass.patients?.length > 0 ? (
                                    groupClass.patients.map((patient: any) => (
                                        <Link 
                                            key={patient.id} 
                                            href={`/patients/${patient.id}`}
                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                                {patient.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{patient.name}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-muted/30 rounded-xl border border-dashed border-border">
                                        <p className="text-sm text-muted-foreground">Nenhum aluno matriculado nesta turma ainda.</p>
                                    </div>
                                )}
                            </div>
                            
                            <Button variant="outline" className="w-full mt-4 gap-2 border-dashed rounded-xl">
                                <Plus className="size-4" /> Adicionar Aluno
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right Column - Agendamentos */}
                    <div className="space-y-6 lg:col-span-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm flex-1 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <CalendarDays className="size-5 text-primary" /> Agendamentos (Aulas)
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Sessões agendadas no calendário para esta turma.
                                    </p>
                                </div>
                                <Button className="gap-2 rounded-xl" onClick={handleGenerateAppointments} disabled={generating}>
                                    <PlayCircle className="size-4" /> {generating ? 'Gerando...' : 'Gerar Aulas'}
                                </Button>
                            </div>

                            {futureAppointments.length > 0 ? (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {futureAppointments.map((appointment: any) => (
                                        <Link 
                                            key={appointment.id} 
                                            href={`/appointments/${appointment.id}`}
                                            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center bg-primary/5 rounded-lg px-3 py-2 text-primary border border-primary/10">
                                                    <span className="text-xs font-semibold uppercase">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })}</span>
                                                    <span className="text-xl font-bold leading-none">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' })}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold">{appointment.start_time.substring(0, 5)}</span>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                            appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {appointment.status === 'scheduled' ? 'Agendado' :
                                                             appointment.status === 'completed' ? 'Realizado' : 'Cancelado'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {appointment.patients?.length || 0} participantes confirmados
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                Ver →
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                                    <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Calendar className="size-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-base font-semibold mb-1">Nenhuma aula gerada</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                        As sessões reais dessa turma ainda não foram criadas na sua agenda.
                                    </p>
                                    <Button className="gap-2 rounded-xl shadow-sm" onClick={handleGenerateAppointments} disabled={generating}>
                                        <PlayCircle className="size-4" /> {generating ? 'Gerando...' : 'Gerar Próximas Aulas'}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            {modal}
            
            <GroupClassFormSheet 
                isOpen={isEditSheetOpen}
                setIsOpen={setIsEditSheetOpen}
                groupClass={groupClass}
                patients={patients}
            />
        </AppLayout>
    );
}
