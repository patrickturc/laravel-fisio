import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Activity, Search, FileText, User, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Evoluções', href: '/evolutions' },
];

interface PaginatedEvolutions {
    data: any[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function EvolutionsIndex({ evolutions, filters = {} }: { evolutions: PaginatedEvolutions; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters.tipo || '');

    function applyFilters(overrides?: any) {
        const params: any = {};
        const s = overrides?.search ?? search;
        const t = overrides?.tipo ?? tipoFilter;

        if (s) params.search = s;
        if (t) params.tipo = t;

        router.get('/evolutions', params, { preserveState: true, replace: true });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') applyFilters();
    }

    function clearFilters() {
        setSearch('');
        setTipoFilter('');
        router.get('/evolutions', {}, { preserveState: true, replace: true });
    }

    const hasFilters = filters.search || filters.tipo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evoluções - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Evoluções (SOAP)</h1>
                        <p className="text-muted-foreground mt-1">Acompanhe histórico e progresso clínico dos pacientes.</p>
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
                        <select
                            value={tipoFilter}
                            onChange={e => { setTipoFilter(e.target.value); applyFilters({ tipo: e.target.value || undefined }); }}
                            className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="sessao">Sessão</option>
                            <option value="avaliacao">Avaliação</option>
                            <option value="reavaliacao">Reavaliação</option>
                        </select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border">
                                Limpar
                            </button>
                        )}
                        <Link
                            href="/evolutions/create"
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Activity className="size-4" />
                            <span className="hidden sm:inline">Nova Evolução</span>
                        </Link>
                    </div>
                </div>

                {/* List section with Glassmorphism */}
                <div className="bg-card/60 backdrop-blur-xl border border-border/50 overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="p-2">
                        {evolutions.data.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {evolutions.data.map((evo: any, index: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={evo.id}
                                        className="p-4 md:p-6 hover:bg-muted/30 transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                                                    <CalendarIcon className="size-3.5" />
                                                    {new Date(evo.data_atendimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </div>
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                                    evo.tipo_atendimento === 'avaliacao' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                    evo.tipo_atendimento === 'reavaliacao' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                    {evo.tipo_atendimento === 'avaliacao' ? 'Avaliação' : evo.tipo_atendimento === 'reavaliacao' ? 'Reavaliação' : 'Evolução'}
                                                </span>
                                                {evo.dor_eva !== null && (
                                                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
                                                        Dor EVA: {evo.dor_eva}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                                                <User className="size-4 text-muted-foreground" />
                                                <span className="truncate">{evo.patient?.name || 'Paciente não encontrado'}</span>
                                            </h3>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 break-words">
                                                <strong>Subjetivo:</strong> {evo.queixa_principal || evo.relato_paciente || 'Sem relato subjetivo.'} <br/>
                                                <strong>Objetivo:</strong> {evo.condutas_realizadas || 'Sem conduta detalhada.'}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0 flex items-center md:flex-col justify-between md:justify-center gap-3">
                                            <Link
                                                href={`/evolutions/${evo.id}`}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-background border border-border/80 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all shadow-sm group-hover:shadow"
                                            >
                                                Ver Detalhes
                                                <ArrowUpRight className="size-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center">
                                <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6 shadow-sm">
                                    <FileText className="size-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Nenhuma evolução</h3>
                                <p className="text-muted-foreground max-w-sm">Os registros clínicos e SOAP dos pacientes aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                    {evolutions.total > 0 && (
                        <div className="border-t border-border/30 px-6">
                            <Pagination links={evolutions.links} from={evolutions.from} to={evolutions.to} total={evolutions.total} />
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
