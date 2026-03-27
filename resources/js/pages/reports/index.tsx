import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Users, Calendar, FileText, TrendingUp, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Relatórios', href: '/reports' },
];

interface Stats {
    totalPatients: number;
    pilatesCount: number;
    physioCount: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalEvolutions: number;
    completionRate: number;
}

interface MonthData {
    month: string;
    total: number;
    completed?: number;
    cancelled?: number;
    scheduled?: number;
}

interface TopPatient {
    id: string;
    name: string;
    type: string;
    appointments_count: number;
}

interface Props {
    stats: Stats;
    appointmentsPerMonth: MonthData[];
    evolutionsPerMonth: MonthData[];
    topPatients: TopPatient[];
}

const monthLabels: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

function BarChart({ data, label }: { data: MonthData[]; label: string }) {
    const maxVal = Math.max(...data.map(d => d.total), 1);
    return (
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{label}</h3>
            <div className="flex items-end gap-2 h-40">
                {data.map((d, i) => {
                    const month = d.month.split('-')[1];
                    const height = (d.total / maxVal) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                                className="w-full bg-gradient-to-t from-primary to-emerald-400 rounded-t-lg relative group min-h-[4px]"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {d.total}
                                </div>
                            </motion.div>
                            <span className="text-[10px] text-muted-foreground font-medium">{monthLabels[month] || month}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function ReportsIndex({ stats, appointmentsPerMonth, evolutionsPerMonth, topPatients }: Props) {
    const kpis = [
        { label: 'Total Pacientes', value: stats.totalPatients, icon: Users, color: 'from-primary to-blue-500', bg: 'bg-primary/10', textColor: 'text-primary' },
        { label: 'Total Agendamentos', value: stats.totalAppointments, icon: Calendar, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', textColor: 'text-emerald-600' },
        { label: 'Total Evoluções', value: stats.totalEvolutions, icon: FileText, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-500/10', textColor: 'text-indigo-600' },
        { label: 'Taxa de Conclusão', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', textColor: 'text-amber-600' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatórios - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Relatórios</h1>
                    <p className="text-muted-foreground mt-1">Visão geral do desempenho do seu estúdio.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                                    <kpi.icon className={`size-5 ${kpi.textColor}`} />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">{kpi.label}</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-foreground">{kpi.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <BarChart data={appointmentsPerMonth} label="Agendamentos por Mês" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <BarChart data={evolutionsPerMonth} label="Evoluções por Mês" />
                    </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Patients by type */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Pacientes por Tipo</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Pilates</span>
                                    <span className="text-muted-foreground">{stats.pilatesCount}</span>
                                </div>
                                <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.totalPatients > 0 ? (stats.pilatesCount / stats.totalPatients) * 100 : 0}%` }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Fisioterapia</span>
                                    <span className="text-muted-foreground">{stats.physioCount}</span>
                                </div>
                                <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.totalPatients > 0 ? (stats.physioCount / stats.totalPatients) * 100 : 0}%` }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-2xl text-foreground">{stats.completedAppointments}</span>
                                <span className="text-muted-foreground">realizados</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-2xl text-red-500">{stats.cancelledAppointments}</span>
                                <span className="text-muted-foreground">cancelados</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top patients */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Award className="size-4 text-amber-500" /> Pacientes Mais Frequentes
                        </h3>
                        <div className="space-y-3">
                            {topPatients.map((patient, i) => (
                                <div key={patient.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{patient.name}</p>
                                        <span className={`text-xs font-medium ${patient.type === 'pilates' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            {patient.type === 'pilates' ? 'Pilates' : 'Fisioterapia'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">
                                        {patient.appointments_count} sessões
                                    </span>
                                </div>
                            ))}
                            {topPatients.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
