import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Users, Calendar, FileText, Clock, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DayAppointment {
    id: string;
    appointment_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    patient: { id: string; name: string; type: string };
}

interface WeekDay {
    date: string;
    dayName: string;
    dayNumber: number;
    isToday: boolean;
    isSelected: boolean;
}

interface UpcomingBirthday {
    id: string;
    name: string;
    birthdate: string;
    isToday: boolean;
    daysToBirthday: number;
    age_turning: number;
}

interface Props {
    totalPatients: number;
    dayAppointments: DayAppointment[];
    dayCount: number;
    pendingEvolutions: number;
    selectedDate: string;
    weekDays: WeekDay[];
    weekLabel: string;
    upcomingBirthdays: UpcomingBirthday[];
}

function navigateToDate(date: string) {
    router.get('/dashboard', { date }, { preserveState: true, preserveScroll: true });
}

function shiftWeek(currentDate: string, direction: number) {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + direction * 7);
    navigateToDate(d.toISOString().split('T')[0]);
}

export default function Dashboard({ totalPatients, dayAppointments, dayCount, pendingEvolutions, selectedDate, weekDays, weekLabel, upcomingBirthdays }: Props) {
    const statusLabel: Record<string, string> = { scheduled: 'Agendado', completed: 'Realizado', cancelled: 'Cancelado' };
    const statusColor: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

    const selectedDayFormatted = new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bom dia! 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">Aqui está o resumo do seu dia.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl"><Users className="size-5 text-primary" /></div>
                            <Link href="/patients" className="text-xs font-semibold text-primary hover:text-primary/80">Ver todos →</Link>
                        </div>
                        <p className="text-3xl font-bold">{totalPatients}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Pacientes cadastrados</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl"><Calendar className="size-5 text-emerald-600" /></div>
                            <Link href="/appointments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500">Ver agenda →</Link>
                        </div>
                        <p className="text-3xl font-bold">{dayCount}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Sessões neste dia</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 bg-amber-500/10 rounded-xl"><FileText className="size-5 text-amber-600" /></div>
                            <Link href="/evolutions" className="text-xs font-semibold text-amber-600 hover:text-amber-500">Ver todas →</Link>
                        </div>
                        <p className="text-3xl font-bold">{pendingEvolutions}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Evoluções pendentes</p>
                    </motion.div>
                </div>

                {/* Weekly Agenda */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">

                    {/* Week Navigation Header */}
                    <div className="px-6 pt-5 pb-4 border-b border-border/30">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="size-5 text-primary" />
                                Agenda Semanal
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => shiftWeek(selectedDate, -1)}
                                    className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <span className="text-sm font-medium text-muted-foreground min-w-[180px] text-center">{weekLabel}</span>
                                <button
                                    onClick={() => shiftWeek(selectedDate, 1)}
                                    className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                            <Link href="/appointments/create" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                                <Plus className="size-4" /> Agendar
                            </Link>
                        </div>

                        {/* Day Pills */}
                        <div className="flex gap-2">
                            {weekDays.map((day) => (
                                <button
                                    key={day.date}
                                    onClick={() => navigateToDate(day.date)}
                                    className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-xl transition-all text-center cursor-pointer border
                                        ${day.isSelected
                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                            : day.isToday
                                                ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                                                : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/40 hover:border-border/30'
                                        }`}
                                >
                                    <span className="text-[10px] font-semibold uppercase tracking-wider">{day.dayName}</span>
                                    <span className={`text-lg font-bold mt-0.5 ${day.isSelected ? 'text-white' : ''}`}>{day.dayNumber}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Day Appointments */}
                    <div className="p-6">
                        <p className="text-sm font-medium text-muted-foreground mb-4 capitalize">{selectedDayFormatted}</p>

                        {dayAppointments.length === 0 ? (
                            <div className="text-center py-10">
                                <Calendar className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">Nenhuma sessão neste dia.</p>
                                <Link href="/appointments/create" className="text-primary text-sm font-semibold hover:text-primary/80 mt-2 inline-block">
                                    Criar agendamento →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {dayAppointments.map((app) => (
                                    <Link key={app.id} href={`/appointments/${app.id}`}
                                        className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/40 transition-colors border border-border/20 group">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[52px]">
                                                <p className="text-lg font-bold text-foreground">{app.start_time?.slice(0, 5)}</p>
                                                <p className="text-xs text-muted-foreground">{app.duration_minutes}min</p>
                                            </div>
                                            <div className="h-10 w-px bg-border/30" />
                                            <div>
                                                <p className="font-semibold text-sm">{app.patient.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{app.patient.type === 'pilates' ? 'Pilates' : 'Fisioterapia'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[app.status]}`}>
                                                {statusLabel[app.status]}
                                            </span>
                                            <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Upcoming Birthdays */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-xl">🎂</span> Próximos Aniversários
                        </h2>
                    </div>
                    
                    {upcomingBirthdays.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground text-sm">Nenhum aniversário nos próximos 7 dias.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingBirthdays.map(patient => (
                                <Link key={patient.id} href={`/patients/${patient.id}`}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${patient.isToday ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-transparent border-border/40 hover:bg-muted/30'}`}>
                                    <div className={`flex items-center justify-center size-12 rounded-full font-bold ${patient.isToday ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-muted text-muted-foreground'}`}>
                                        {patient.age_turning}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-sm truncate">{patient.name}</p>
                                        <p className={`text-xs mt-0.5 ${patient.isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                            {patient.isToday ? 'Hoje! 🎉' : `Daqui a ${patient.daysToBirthday} dia(s)`}
                                        </p>
                                    </div>
                                    <ChevronRight className="size-4 text-muted-foreground/40" />
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/patients/create" className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors"><Plus className="size-5 text-primary" /></div>
                        <div><p className="font-semibold text-sm">Novo Paciente</p><p className="text-xs text-muted-foreground">Cadastrar paciente</p></div>
                    </Link>
                    <Link href="/appointments/create" className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors"><Calendar className="size-5 text-emerald-600" /></div>
                        <div><p className="font-semibold text-sm">Agendar Sessão</p><p className="text-xs text-muted-foreground">Criar agendamento</p></div>
                    </Link>
                    <Link href="/evolutions/create" className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all group flex items-center gap-4">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors"><FileText className="size-5 text-amber-600" /></div>
                        <div><p className="font-semibold text-sm">Nova Evolução</p><p className="text-xs text-muted-foreground">Registrar atendimento</p></div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
