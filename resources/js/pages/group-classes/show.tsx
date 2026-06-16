import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Users, ArrowLeft, Calendar, User, Clock, Settings, Plus, PlayCircle, Trash2, CalendarDays, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';
import { Pagination } from '@/components/pagination';
import { GroupClassFormSheet } from './group-class-form-sheet';
import { InlineEdit } from '@/components/inline-edit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function GroupClassShow({ groupClass, futureAppointments = [], lastAppointmentDate = null, occupancy = null, patients, users = [] }: { groupClass: any, futureAppointments?: any[], lastAppointmentDate?: string | null, occupancy?: { total_classes: number; avg_participants: number; occupancy_rate: number; attended: number; missed: number; cancelled: number; attendance_rate: number } | null, patients: any[], users?: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turmas', href: '/group-classes' },
        { title: groupClass.name, href: `/group-classes/${groupClass.id}` },
    ];

    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateEndDate, setGenerateEndDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    });
    const [generateReschedule, setGenerateReschedule] = useState(false);
    const { confirm, modal } = useConfirmModal();
    const [isGenerating, setIsGenerating] = useState(false);

    function handleGenerateAppointments() {
        setIsGenerating(true);
        router.post(`/group-classes/${groupClass.id}/generate-appointments`, {
            end_date: generateEndDate,
            reschedule: generateReschedule,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowGenerateModal(false);
                setIsGenerating(false);
                setGenerateReschedule(false);
            },
            onError: () => setIsGenerating(false),
        });
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
                            <div className="size-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner" style={{ backgroundColor: groupClass.color || '#8b5cf6' }}>
                                <Users className="size-8" />
                            </div>
                            <div>
                                <InlineEdit 
                                    value={groupClass.name}
                                    onSave={(val) => router.put(`/group-classes/${groupClass.id}`, { name: val }, { preserveScroll: true })}
                                    className="text-2xl font-bold tracking-tight bg-transparent"
                                />
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        groupClass.status === 'active' 
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        <InlineEdit 
                                            value={groupClass.status}
                                            type="select"
                                            options={[
                                                { value: 'active', label: 'Ativa' },
                                                { value: 'inactive', label: 'Inativa' }
                                            ]}
                                            onSave={(val) => router.put(`/group-classes/${groupClass.id}`, { status: val }, { preserveScroll: true })}
                                            className="font-semibold text-xs"
                                        />
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        <InlineEdit 
                                            value={String(groupClass.max_participants)}
                                            type="number"
                                            onSave={(val) => router.put(`/group-classes/${groupClass.id}`, { max_participants: Number(val) }, { preserveScroll: true })}
                                            className="w-16 text-xs text-center"
                                            renderDisplay={(val) => <span>{groupClass.patients?.length || 0} de {val} alunos</span>}
                                        />
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
                            
                            <Button variant="outline" onClick={() => setIsEditSheetOpen(true)} className="w-full mt-4 gap-2 border-dashed rounded-xl">
                                <Plus className="size-4" /> Adicionar Aluno
                            </Button>
                        </motion.div>

                        {occupancy && occupancy.total_classes > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                            >
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <BarChart3 className="size-5 text-primary" /> Ocupação
                                </h2>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm text-muted-foreground">Taxa média de ocupação</span>
                                        <span className="text-sm font-bold">{occupancy.occupancy_rate}%</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, occupancy.occupancy_rate)}%` }} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Média de {occupancy.avg_participants} de {groupClass.max_participants} alunos por aula • {occupancy.total_classes} aulas
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{occupancy.attended}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Presenças</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{occupancy.missed}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Faltas</p>
                                    </div>
                                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3">
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{occupancy.cancelled}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Cancel.</p>
                                    </div>
                                </div>

                                {(occupancy.attended + occupancy.missed) > 0 && (
                                    <p className="text-xs text-muted-foreground mt-3 text-center">
                                        Taxa de comparecimento: <span className="font-semibold text-foreground">{occupancy.attendance_rate}%</span>
                                    </p>
                                )}
                            </motion.div>
                        )}
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
                                    {lastAppointmentDate ? (
                                        <p className="text-sm font-medium text-primary mt-1 flex items-center gap-1.5">
                                            <CalendarDays className="size-4" />
                                            Aulas geradas até {new Date(lastAppointmentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-medium text-amber-600 mt-1">
                                            Nenhuma aula gerada ainda.
                                        </p>
                                    )}
                                </div>
                                <Button className="gap-2 rounded-xl" onClick={() => setShowGenerateModal(true)}>
                                    <PlayCircle className="size-4" /> Gerar Aulas
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
                                    <Button className="gap-2 rounded-xl shadow-sm" onClick={() => setShowGenerateModal(true)}>
                                        <PlayCircle className="size-4" /> Gerar Próximas Aulas
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            {modal}
            
            {/* Generate Appointments Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowGenerateModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-1">Gerar Aulas na Agenda</h3>
                        <p className="text-sm text-muted-foreground mb-5">
                            Defina até qual data deseja gerar os agendamentos para esta turma.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Gerar aulas até:</Label>
                                <Input 
                                    type="date" 
                                    value={generateEndDate}
                                    onChange={e => setGenerateEndDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            
                            {futureAppointments.length > 0 && (
                                <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={generateReschedule}
                                        onChange={e => setGenerateReschedule(e.target.checked)}
                                        className="mt-0.5 size-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Reagendar aulas existentes</p>
                                        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                                            Remove todos os agendamentos futuros pendentes desta turma e gera novos com os horários atuais.
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>
                        
                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setShowGenerateModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleGenerateAppointments} disabled={isGenerating}>
                                <PlayCircle className="size-4 mr-2" />
                                {isGenerating ? 'Gerando...' : 'Gerar Aulas'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <GroupClassFormSheet 
                isOpen={isEditSheetOpen} 
                setIsOpen={setIsEditSheetOpen} 
                groupClass={groupClass}
                patients={patients}
                users={users}
            />
        </AppLayout>
    );
}
