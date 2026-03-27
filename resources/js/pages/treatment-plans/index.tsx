import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ClipboardList, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Planos de Tratamento', href: '/treatment-plans' },
];

interface PaginatedPlans {
    data: any[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function TreatmentPlansIndex({ plans, filters = {} }: { plans: PaginatedPlans; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    function applyFilters(overrides?: any) {
        const params: any = {};
        const s = overrides?.search ?? search;
        const st = overrides?.status ?? statusFilter;
        if (s) params.search = s;
        if (st) params.status = st;
        router.get('/treatment-plans', params, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch(''); setStatusFilter('');
        router.get('/treatment-plans', {}, { preserveState: true, replace: true });
    }

    const statusLabels: Record<string, string> = { active: 'Ativo', paused: 'Pausado', completed: 'Concluído' };
    const statusColors: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    const hasFilters = filters.search || filters.status;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planos de Tratamento - Phisio" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Planos de Tratamento</h1>
                        <p className="text-muted-foreground mt-1">Acompanhe o progresso dos tratamentos dos seus pacientes.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input type="text" placeholder="Buscar paciente..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
                        </div>
                        <select value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value || undefined }); }}
                            className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm">
                            <option value="">Todos</option>
                            <option value="active">Ativo</option>
                            <option value="paused">Pausado</option>
                            <option value="completed">Concluído</option>
                        </select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border">Limpar</button>
                        )}
                        <Link href="/treatment-plans/create" className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                            <Plus className="size-4" /><span className="hidden sm:inline">Novo Plano</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.data.length > 0 ? plans.data.map((plan: any, i: number) => {
                        const pct = plan.total_sessions > 0 ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) : 0;
                        return (
                            <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${statusColors[plan.status]}`}>
                                        {statusLabels[plan.status]}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{new Date(plan.start_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1 truncate">{plan.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4 truncate">{plan.patient?.name || 'Paciente'}</p>

                                {/* Progress bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium">{plan.completed_sessions}/{plan.total_sessions} sessões</span>
                                        <span className="font-bold text-primary">{pct}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                                            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-emerald-400'}`} />
                                    </div>
                                </div>

                                <Link href={`/treatment-plans/${plan.id}`} className="text-sm font-semibold text-primary hover:text-emerald-500 transition-colors mt-4 inline-flex items-center gap-1">
                                    Detalhes →
                                </Link>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card/30 rounded-3xl border border-dashed border-border">
                            <ClipboardList className="size-12 text-muted-foreground/40 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Nenhum plano encontrado</h3>
                            <p className="text-muted-foreground">Crie um plano de tratamento para acompanhar o progresso.</p>
                        </div>
                    )}
                </div>

                {plans.total > 0 && <Pagination links={plans.links} from={plans.from} to={plans.to} total={plans.total} />}
            </div>
        </AppLayout>
    );
}
