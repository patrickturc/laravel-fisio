import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ClipboardList, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Protocolos Clínicos', href: '/clinical-protocols' },
];

interface PaginatedProtocols {
    data: any[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function ClinicalProtocolsIndex({ protocols, filters = {} }: { protocols: PaginatedProtocols; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(overrides?: any) {
        const params: any = {};
        const s = overrides?.search ?? search;
        if (s) params.search = s;
        router.get('/clinical-protocols', params, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch('');
        router.get('/clinical-protocols', {}, { preserveState: true, replace: true });
    }

    const hasFilters = !!filters.search;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Protocolos Clínicos - Phisio" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Protocolos Clínicos</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os protocolos e procedimentos clínicos da sua clínica.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input type="text" placeholder="Buscar protocolo..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" />
                        </div>
                        {hasFilters && (
                            <button onClick={clearFilters} className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border">Limpar</button>
                        )}
                        <Link href="/clinical-protocols/create" className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                            <Plus className="size-4" /><span className="hidden sm:inline">Novo Protocolo</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {protocols.data.length > 0 ? protocols.data.map((protocol: any, i: number) => {
                        return (
                            <motion.div key={protocol.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">{protocol.name}</h3>
                                    {protocol.total_sessions && (
                                        <p className="text-sm font-medium text-emerald-600 mb-3">{protocol.total_sessions} sessões sugeridas</p>
                                    )}
                                    <p className="text-sm text-muted-foreground line-clamp-3">{protocol.description || 'Nenhuma descrição fornecida.'}</p>
                                </div>

                                <Link href={`/clinical-protocols/${protocol.id}`} className="text-sm font-semibold text-primary hover:text-emerald-500 transition-colors mt-6 inline-flex items-center gap-1">
                                    Detalhes →
                                </Link>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card/30 rounded-3xl border border-dashed border-border">
                            <ClipboardList className="size-12 text-muted-foreground/40 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Nenhum protocolo encontrado</h3>
                            <p className="text-muted-foreground">Cadastre procedimentos como RPG, Pilates, Acupuntura, etc.</p>
                        </div>
                    )}
                </div>

                {protocols.total > 0 && <Pagination links={protocols.links} from={protocols.from} to={protocols.to} total={protocols.total} />}
            </div>
        </AppLayout>
    );
}
