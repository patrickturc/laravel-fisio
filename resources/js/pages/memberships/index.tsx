import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Search, Tag, User, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/components/pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Matrículas', href: '/memberships' },
];

export default function MembershipsIndex({ memberships, filters = {} }: { memberships: any; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    function applyFilters() {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        router.get('/memberships', params, { preserveState: true, replace: true });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') applyFilters();
    }

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-700">Ativa</span>;
            case 'expired':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-700">Vencida</span>;
            case 'cancelled':
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700">Cancelada</span>;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Matrículas - Phisio" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Matrículas e Planos</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os planos de assinatura dos seus alunos.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar aluno..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); applyFilters(); }}
                            className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        >
                            <option value="">Todos Status</option>
                            <option value="active">Ativas</option>
                            <option value="expired">Vencidas</option>
                            <option value="cancelled">Canceladas</option>
                        </select>
                        <Link
                            href="/memberships/create"
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Nova Matrícula</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden mt-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Aluno</th>
                                    <th className="px-6 py-4 font-semibold">Plano</th>
                                    <th className="px-6 py-4 font-semibold">Período</th>
                                    <th className="px-6 py-4 font-semibold">Valor</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {memberships.data.length > 0 ? (
                                    memberships.data.map((membership: any) => (
                                        <tr key={membership.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                <div className="bg-primary/10 p-1.5 rounded-md">
                                                    <User className="size-4 text-primary" />
                                                </div>
                                                <Link href={`/patients/${membership.patient_id}`} className="hover:text-primary transition-colors">
                                                    {membership.patient?.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                                                    <Tag className="size-3.5 text-muted-foreground" />
                                                    {membership.commercial_plan?.name || membership.plan_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="size-3.5" />
                                                    {new Date(membership.start_date).toLocaleDateString()} a {new Date(membership.end_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                                                R$ {parseFloat(membership.price).toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(membership.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/memberships/${membership.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                                                    Ver Detalhes
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhuma matrícula encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {memberships.total > 0 && (
                    <div className="mt-4">
                        <Pagination links={memberships.links} from={memberships.from} to={memberships.to} total={memberships.total} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
