import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Search, Tag, User, Calendar as CalendarIcon, DollarSign, Save } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Pagination } from '@/components/pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Matrículas', href: '/memberships' },
];

export default function MembershipsIndex({ 
    memberships, 
    filters = {},
    patients = [],
    commercialPlans = []
}: { 
    memberships: any; 
    filters?: any;
    patients?: any[];
    commercialPlans?: any[];
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        patient_id: '',
        commercial_plan_id: '',
        plan_name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        price: '',
        status: 'active',
        billing_day: 10,
    });

    function applyFilters() {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        router.get('/memberships', params, { preserveState: true, replace: true });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') applyFilters();
    }

    const openCreate = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setSheetOpen(true);
    };

    const openEdit = (membership: any) => {
        setEditingId(membership.id);
        clearErrors();
        setData({
            patient_id: membership.patient_id || '',
            commercial_plan_id: membership.commercial_plan_id || '',
            plan_name: membership.plan_name || '',
            start_date: membership.start_date ? membership.start_date.split('T')[0] : '',
            end_date: membership.end_date ? membership.end_date.split('T')[0] : '',
            price: membership.price || '',
            status: membership.status || 'active',
            billing_day: membership.billing_day || 10,
        });
        setSheetOpen(true);
    };

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const planId = e.target.value;
        const selectedPlan = commercialPlans.find(p => p.id === planId);
        
        if (selectedPlan) {
            let newEndDate = data.end_date;
            if (selectedPlan.duration_months && data.start_date) {
                const start = new Date(data.start_date);
                start.setMonth(start.getMonth() + selectedPlan.duration_months);
                newEndDate = start.toISOString().split('T')[0];
            }
            
            setData(data => ({
                ...data,
                commercial_plan_id: planId,
                price: selectedPlan.price,
                end_date: newEndDate,
                plan_name: selectedPlan.name
            }));
        } else {
            setData('commercial_plan_id', '');
        }
    };

    function submitForm(e: FormEvent) {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSheetOpen(false);
                reset();
            }
        };

        if (editingId) {
            put(`/memberships/${editingId}`, options);
        } else {
            post('/memberships', options);
        }
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
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Nova Matrícula</span>
                        </button>
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
                                                <div className="flex justify-end gap-3 items-center">
                                                    <button onClick={() => openEdit(membership)} className="text-primary hover:text-primary/80 font-medium text-sm">
                                                        Editar
                                                    </button>
                                                    <Link href={`/memberships/${membership.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                                                        Ver Detalhes
                                                    </Link>
                                                </div>
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

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto border-l-border/50">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                            {editingId ? 'Editar Matrícula' : 'Nova Matrícula'}
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            {editingId ? 'Atualize os dados do plano do aluno.' : 'Crie um novo plano ou pacote para o aluno.'}
                        </p>
                    </SheetHeader>

                    <form onSubmit={submitForm} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Aluno</label>
                            <select
                                value={data.patient_id}
                                onChange={e => setData('patient_id', e.target.value)}
                                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                required
                            >
                                <option value="">Selecione o aluno...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.patient_id && <p className="text-sm text-red-500 mt-1">{errors.patient_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Pacote Comercial</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <select
                                    value={data.commercial_plan_id || ''}
                                    onChange={handlePlanChange}
                                    className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                    required
                                >
                                    <option value="">Selecione um pacote...</option>
                                    {commercialPlans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.commercial_plan_id && <p className="text-sm text-red-500 mt-1">{errors.commercial_plan_id}</p>}
                            {errors.plan_name && <p className="text-sm text-red-500 mt-1">{errors.plan_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Status</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                required
                            >
                                <option value="active">Ativa</option>
                                <option value="expired">Vencida</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Início do Plano</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Vencimento do Plano</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Valor (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="150.00"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Dia de Vencimento</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={data.billing_day}
                                    onChange={e => setData('billing_day', parseInt(e.target.value) || 1)}
                                    className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                />
                                {errors.billing_day && <p className="text-sm text-red-500 mt-1">{errors.billing_day}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Todo dia {data.billing_day}, uma cobrança pendente será gerada automaticamente.</p>

                        <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSheetOpen(false)}
                                className="h-11 px-6 flex items-center justify-center border border-border bg-card hover:bg-muted text-foreground font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="h-11 px-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Save className="size-4" />
                                {editingId ? 'Salvar Alterações' : 'Salvar Matrícula'}
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
