import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CalendarPlus, Search, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Agenda', href: '/appointments' },
];

interface PaginatedAppointments {
    data: any[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function AppointmentsIndex({ appointments, filters = {} }: { appointments: PaginatedAppointments; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    function applyFilters(overrides?: any) {
        const params: any = { ...overrides };
        const s = overrides?.search ?? search;
        const st = overrides?.status ?? statusFilter;
        const df = overrides?.date_from ?? dateFrom;
        const dt = overrides?.date_to ?? dateTo;

        if (s) params.search = s;
        if (st) params.status = st;
        if (df) params.date_from = df;
        if (dt) params.date_to = dt;

        router.get('/appointments', params, { preserveState: true, replace: true });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') applyFilters();
    }

    function clearFilters() {
        setSearch('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        router.get('/appointments', {}, { preserveState: true, replace: true });
    }

    const hasFilters = filters.search || filters.status || filters.date_from || filters.date_to;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Agenda</h1>
                        <p className="text-muted-foreground mt-1">Gerencie suas consultas e sessões diárias.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                            />
                        </div>
                        <Link
                            href="/appointments/create"
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <CalendarPlus className="size-4" />
                            <span className="hidden sm:inline">Novo Agendamento</span>
                        </Link>
                    </div>
                </div>

                {/* Filters bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value || undefined }); }}
                        className="h-9 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                    >
                        <option value="">Todos os status</option>
                        <option value="scheduled">Agendado</option>
                        <option value="completed">Realizado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value || undefined }); }}
                        className="h-9 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        placeholder="De"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value || undefined }); }}
                        className="h-9 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        placeholder="Até"
                    />
                    {hasFilters && (
                        <button onClick={clearFilters} className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border">
                            Limpar
                        </button>
                    )}
                </div>

                {/* Grid view of appointments */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.data.length > 0 ? (
                        appointments.data.map((app: any, index: number) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                key={app.id}
                                className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 hover:shadow-lg transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-emerald-500 rounded-l-2xl"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                        <CalendarIcon className="size-4" />
                                        {new Date(app.appointment_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-foreground/80 bg-muted/60 px-3 py-1.5 rounded-lg border border-border/50">
                                        <Clock className="size-4 text-primary" />
                                        {app.start_time?.substring(0,5)}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                                    <div className="bg-primary/10 p-1.5 rounded-lg">
                                        <User className="size-5 text-primary" />
                                    </div>
                                    <span className="truncate">{app.patient?.name || 'Não encontrado'}</span>
                                </h3>

                                <p className="text-sm text-muted-foreground line-clamp-2 mt-4 min-h-[40px]">
                                    {app.notes || 'Sem observações.'}
                                </p>

                                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                                        app.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        app.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {app.status === 'completed' ? 'Concluído' : app.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                                    </span>

                                    <Link href={`/appointments/${app.id}`} className="text-sm font-semibold text-primary hover:text-emerald-500 transition-colors flex items-center gap-1">
                                        Detalhes <span aria-hidden="true">&rarr;</span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card/30 rounded-3xl border border-dashed border-border">
                            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm">
                                <CalendarIcon className="size-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-foreground">Sem agendamentos</h3>
                            <p className="text-muted-foreground max-w-sm">Nenhuma consulta encontrada para a sua busca ou agenda vazia.</p>
                        </div>
                    )}
                </div>

                {appointments.total > 0 && (
                    <Pagination links={appointments.links} from={appointments.from} to={appointments.to} total={appointments.total} />
                )}
            </div>
        </AppLayout>
    );
}
