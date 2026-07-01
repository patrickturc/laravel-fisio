import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, Clock, User, Users, FileText, CheckCircle2, XCircle, Clock4, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';
import { useState } from 'react';
import EvolutionFormSheet from '@/components/EvolutionFormSheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';

interface Patient {
    id: string;
    name: string;
    type: string;
    pivot: {
        status: 'scheduled' | 'attended' | 'missed' | 'cancelled';
    };
}

interface Appointment {
    id: string;
    type: 'individual' | 'group';
    title: string | null;
    max_participants: number;
    appointment_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    notes: string | null;
    patients?: Array<{ id: string; name: string; pivot?: { status: string } }>;
}

export default function AppointmentShow({ appointment, protocols = [] }: { appointment: Appointment, protocols?: Array<{ id: string; name: string }> }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agenda', href: '/appointments' },
        { title: `${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}`, href: `/appointments/${appointment.id}` },
    ];

    const { can } = usePermissions();
    const [isEvolutionSheetOpen, setIsEvolutionSheetOpen] = useState(false);
    const { confirm, modal } = useConfirmModal();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    async function handleDelete() {
        setShowDeleteModal(true);
    }

    function executeDelete(mode: 'single' | 'future') {
        router.delete(`/appointments/${appointment.id}?delete_mode=${mode}`, {
            preserveScroll: true,
            onSuccess: () => setShowDeleteModal(false)
        });
    }

    function updatePatientStatus(patientId: string, status: string) {
        router.post(`/appointments/${appointment.id}/patients/${patientId}/status`, { status }, {
            preserveScroll: true,
        });
    }

    const statusLabel: Record<string, string> = { scheduled: 'Agendado', completed: 'Realizado', cancelled: 'Cancelado' };
    const statusColor: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

    const pivotStatusInfo: Record<string, { label: string, color: string, icon: any }> = {
        scheduled: { label: 'Agendado', color: 'text-blue-600 bg-blue-100', icon: Clock4 },
        attended: { label: 'Presente', color: 'text-emerald-600 bg-emerald-100', icon: CheckCircle2 },
        missed: { label: 'Faltou', color: 'text-amber-600 bg-amber-100', icon: XCircle },
        cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-100', icon: XCircle },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalhes do Agendamento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/appointments" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"><ArrowLeft className="size-5" /></Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                {appointment.type === 'group' ? <Users className="size-6 text-primary" /> : <User className="size-6 text-primary" />}
                                {appointment.type === 'group' ? (appointment.title || 'Turma') : 'Detalhes do Agendamento'}
                            </h1>
                            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${statusColor[appointment.status]}`}>{statusLabel[appointment.status]}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('appointments.manage.edit') && (
                            <Link href={`/appointments/${appointment.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"><Edit className="size-4" /></Link>
                        )}
                        {can('appointments.manage.delete') && (
                            <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="size-4" /></button>
                        )}
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Users className="size-4" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <p className="font-semibold text-sm">
                                {appointment.type === 'group' ? `Turma (${appointment.patients?.length || 0}/${appointment.max_participants} participantes)` : 'Sessão Individual'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600"><Clock className="size-4" /></div>
                        <div><p className="text-xs text-muted-foreground">Data e Horário</p><p className="font-semibold text-sm">{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.start_time?.slice(0, 5)} ({appointment.duration_minutes}min)</p></div>
                    </div>
                </motion.div>

                {/* Patients List */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/50 flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <User className="size-5 text-primary" /> Pacientes
                        </h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {appointment.patients?.map(patient => {
                            const pStatus = patient.pivot?.status || 'scheduled';
                            const StatusIcon = pivotStatusInfo[pStatus].icon;
                            return (
                                <div key={patient.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link href={`/patients/${patient.id}`} className="font-semibold text-sm hover:underline">{patient.name}</Link>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${pivotStatusInfo[pStatus].color}`}>
                                                    <StatusIcon className="size-3" />
                                                    {pivotStatusInfo[pStatus].label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {can('appointments.manage.edit') && (
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border/50">
                                                    Alterar Status
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'scheduled')} className="flex items-center gap-2 cursor-pointer">
                                                    <Clock4 className="size-4 text-blue-500" /> Agendado
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'attended')} className="flex items-center gap-2 cursor-pointer">
                                                    <CheckCircle2 className="size-4 text-emerald-500" /> Presente
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'missed')} className="flex items-center gap-2 cursor-pointer">
                                                    <XCircle className="size-4 text-amber-500" /> Faltou
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updatePatientStatus(patient.id, 'cancelled')} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                                                    <XCircle className="size-4 text-red-500" /> Cancelado
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    )}
                                </div>
                            );
                        })}
                        {(!appointment.patients || appointment.patients.length === 0) && (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                Nenhum paciente vinculado a este agendamento.
                            </div>
                        )}
                    </div>
                </motion.div>

                {appointment.notes && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><FileText className="size-5 text-primary" /> Observações</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
                    </motion.div>
                )}

                {/* Register Evolution Action */}
                {appointment.status === 'scheduled' && appointment.type === 'individual' && appointment.patients?.length === 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <button
                            onClick={() => setIsEvolutionSheetOpen(true)}
                            className="flex items-center justify-center gap-3 w-full p-5 bg-gradient-to-r from-primary to-emerald-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                        >
                            <FileText className="size-5" />
                            Registrar Evolução e Concluir Sessão
                        </button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Ao registrar a evolução, o agendamento será marcado como "Realizado" automaticamente.
                        </p>
                    </motion.div>
                )}
                
                {appointment.status === 'scheduled' && appointment.type === 'group' && can('appointments.manage.edit') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Button
                            onClick={() => router.patch(`/appointments/${appointment.id}/status`, { status: 'completed' }, { preserveScroll: true })}
                            className="flex items-center justify-center gap-3 w-full p-5 bg-gradient-to-r from-primary to-emerald-500 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 h-auto"
                        >
                            <Check className="size-5" />
                            Concluir Sessão da Turma
                        </Button>
                    </motion.div>
                )}

                {appointment.status === 'completed' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">✅ Sessão realizada</p>
                    </motion.div>
                )}
            </div>
            {modal}
            
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-2">Excluir Agendamentos {appointment?.type === 'group' ? 'da Turma' : 'Recorrentes'}</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Você está prestes a excluir um agendamento. Deseja excluir apenas esta aula ou todas as próximas aulas pendentes a partir de hoje?
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => executeDelete('single')}
                                className="justify-start h-auto py-3 px-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">Excluir apenas este evento</div>
                                    <div className="text-xs text-muted-foreground font-normal">Mantém os demais agendamentos intactos.</div>
                                </div>
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => executeDelete('future')}
                                className="justify-start h-auto py-3 px-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">Excluir este e todos os próximos</div>
                                    <div className="text-xs text-white/80 font-normal">Remove este agendamento e os futuros que não foram realizados.</div>
                                </div>
                            </Button>
                            <Button variant="ghost" className="mt-2" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {appointment.patients?.length === 1 && (
                <EvolutionFormSheet
                    isOpen={isEvolutionSheetOpen}
                    onOpenChange={setIsEvolutionSheetOpen}
                    patientId={appointment.patients[0].id}
                    appointmentId={appointment.id}
                    protocols={protocols}
                />
            )}
        </AppLayout>
    );
}
