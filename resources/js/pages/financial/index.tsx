import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Wallet, User, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Pagination } from '@/components/pagination';
import { useConfirmModal } from '@/components/confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Financeiro', href: '/financial' },
];

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const categoryColors: Record<string, string> = {
    'Mensalidade': 'bg-emerald-500',
    'Avaliação': 'bg-blue-500',
    'Sessão Avulsa': 'bg-cyan-500',
    'Matrícula': 'bg-violet-500',
    'Aluguel': 'bg-red-500',
    'Equipamentos': 'bg-orange-500',
    'Material': 'bg-amber-500',
    'Água/Luz/Internet': 'bg-yellow-500',
    'Salários': 'bg-rose-500',
    'Impostos': 'bg-pink-500',
    'Marketing': 'bg-indigo-500',
    'Manutenção': 'bg-slate-500',
    'Outros': 'bg-gray-400',
    'Sem categoria': 'bg-gray-300',
};

interface Props {
    transactions: any;
    summary: any;
    chartData: Array<{ label: string; income: number; expense: number }>;
    categoryBreakdown: { income: Array<{ category: string; total: number }>; expense: Array<{ category: string; total: number }> };
    filters: any;
    currentMonth: number;
    currentYear: number;
}

export default function FinancialIndex({ transactions, summary, chartData, categoryBreakdown, filters = {}, currentMonth, currentYear }: Props) {
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const { confirm, modal } = useConfirmModal();

    function navigate(params: Record<string, any>) {
        const current: Record<string, any> = { month: currentMonth, year: currentYear };
        if (typeFilter) current.type = typeFilter;
        if (statusFilter) current.status = statusFilter;
        if (searchQuery) current.search = searchQuery;
        router.get('/financial', { ...current, ...params }, { preserveState: true, replace: true });
    }

    function prevMonth() {
        let m = currentMonth - 1, y = currentYear;
        if (m < 1) { m = 12; y--; }
        navigate({ month: m, year: y });
    }

    function nextMonth() {
        let m = currentMonth + 1, y = currentYear;
        if (m > 12) { m = 1; y++; }
        navigate({ month: m, year: y });
    }

    function applyFilters() {
        navigate({});
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        navigate({});
    }

    async function handleDelete(t: any) {
        const confirmed = await confirm({
            title: 'Excluir Lançamento',
            message: `Tem certeza que deseja excluir "${t.description}"?`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/financial/${t.id}`, { preserveState: true });
    }

    const formatCurrency = (val: string | number) =>
        Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Chart calculations
    const chartMax = useMemo(() => {
        const vals = chartData.flatMap(d => [d.income, d.expense]);
        return Math.max(...vals, 1);
    }, [chartData]);

    const isOverdue = (t: any) => t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financeiro - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* Header + Month Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Financeiro</h1>
                        <p className="text-muted-foreground mt-1">Fluxo de caixa, mensalidades e despesas do estúdio.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Month Navigator */}
                        <div className="flex items-center gap-1 bg-card border border-border rounded-xl shadow-sm">
                            <button onClick={prevMonth} className="p-2.5 hover:bg-muted/50 rounded-l-xl transition-colors">
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="px-3 py-2 text-sm font-semibold min-w-[140px] text-center">
                                {monthNames[currentMonth - 1]} {currentYear}
                            </span>
                            <button onClick={nextMonth} className="p-2.5 hover:bg-muted/50 rounded-r-xl transition-colors">
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                        <Link
                            href="/financial/create"
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Nova Transação</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><ArrowUpRight className="size-4" /></div>
                            <h3 className="text-sm font-medium text-muted-foreground">Receitas</h3>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.income)}</p>
                        {Number(summary.pending_income) > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">+{formatCurrency(summary.pending_income)} a receber</p>
                        )}
                    </div>
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-500/10 text-red-600 rounded-lg"><ArrowDownRight className="size-4" /></div>
                            <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
                        {Number(summary.pending_expense) > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">+{formatCurrency(summary.pending_expense)} a pagar</p>
                        )}
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/20 text-primary rounded-lg"><Wallet className="size-4" /></div>
                            <h3 className="text-sm font-medium text-primary">Saldo Mensal</h3>
                        </div>
                        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                            {formatCurrency(summary.balance)}
                        </p>
                    </div>
                    <div className={`border rounded-2xl p-5 shadow-sm ${summary.overdue_count > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30' : 'bg-card/60 border-border/50 backdrop-blur-xl'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${summary.overdue_count > 0 ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                                <AlertTriangle className="size-4" />
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">Vencidas</h3>
                        </div>
                        <p className={`text-2xl font-bold ${summary.overdue_count > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{summary.overdue_count}</p>
                        <p className="text-xs text-muted-foreground mt-1">transações pendentes vencidas</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Bar Chart: Receitas vs Despesas (últimos 6 meses) */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm lg:col-span-2">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Receitas vs Despesas — Últimos 6 meses</h3>
                        <div className="flex items-end justify-between gap-2 h-40">
                            {chartData.map((d, i) => {
                                const incH = chartMax > 0 ? (d.income / chartMax) * 100 : 0;
                                const expH = chartMax > 0 ? (d.expense / chartMax) * 100 : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="flex items-end gap-0.5 w-full justify-center h-32">
                                            <div
                                                className="w-[38%] bg-emerald-500/80 rounded-t-md transition-all duration-500 min-h-[2px]"
                                                style={{ height: `${Math.max(incH, 1.5)}%` }}
                                                title={`Receita: ${formatCurrency(d.income)}`}
                                            />
                                            <div
                                                className="w-[38%] bg-red-400/80 rounded-t-md transition-all duration-500 min-h-[2px]"
                                                style={{ height: `${Math.max(expH, 1.5)}%` }}
                                                title={`Despesa: ${formatCurrency(d.expense)}`}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-medium">{d.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500 inline-block" /> Receitas</span>
                            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400 inline-block" /> Despesas</span>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Por Categoria</h3>
                        {(categoryBreakdown.expense.length > 0 || categoryBreakdown.income.length > 0) ? (
                            <div className="space-y-4">
                                {categoryBreakdown.expense.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-2">Despesas</p>
                                        <div className="space-y-2">
                                            {categoryBreakdown.expense.slice(0, 5).map((c: any) => {
                                                const maxCat = categoryBreakdown.expense[0]?.total || 1;
                                                const pct = (c.total / maxCat) * 100;
                                                return (
                                                    <div key={c.category}>
                                                        <div className="flex justify-between text-xs mb-0.5">
                                                            <span className="text-foreground font-medium">{c.category}</span>
                                                            <span className="text-red-600 font-semibold">{formatCurrency(c.total)}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-500 ${categoryColors[c.category] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {categoryBreakdown.income.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium mb-2">Receitas</p>
                                        <div className="space-y-2">
                                            {categoryBreakdown.income.slice(0, 5).map((c: any) => {
                                                const maxCat = categoryBreakdown.income[0]?.total || 1;
                                                const pct = (c.total / maxCat) * 100;
                                                return (
                                                    <div key={c.category}>
                                                        <div className="flex justify-between text-xs mb-0.5">
                                                            <span className="text-foreground font-medium">{c.category}</span>
                                                            <span className="text-emerald-600 font-semibold">{formatCurrency(c.total)}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-500 ${categoryColors[c.category] || 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">Sem dados neste mês.</p>
                        )}
                    </div>
                </div>

                {/* Filters + Search */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por descrição, categoria ou paciente..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onBlur={applyFilters}
                            className="w-full h-10 pl-10 pr-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                        />
                    </form>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setTimeout(applyFilters, 0); }}
                        className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                    >
                        <option value="">Todas</option>
                        <option value="income">Receitas</option>
                        <option value="expense">Despesas</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setTimeout(applyFilters, 0); }}
                        className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                    >
                        <option value="">Todos Status</option>
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                        <option value="overdue">Vencidas</option>
                    </select>
                </div>

                {/* Transactions Table */}
                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold">Data</th>
                                    <th className="px-5 py-3.5 font-semibold">Descrição</th>
                                    <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Categoria</th>
                                    <th className="px-5 py-3.5 font-semibold hidden lg:table-cell">Vencimento</th>
                                    <th className="px-5 py-3.5 font-semibold text-right">Valor</th>
                                    <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                                    <th className="px-5 py-3.5 w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((t: any) => (
                                        <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">
                                                {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                    <div>
                                                        <div className="font-medium text-foreground">{t.description}</div>
                                                        {t.patient && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                <User className="size-3" /> {t.patient.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                                                {t.category ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className={`size-2 rounded-full ${categoryColors[t.category] || 'bg-gray-400'}`} />
                                                        {t.category}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                                                {t.due_date ? (
                                                    <span className={isOverdue(t) ? 'text-red-600 font-semibold' : ''}>
                                                        {new Date(t.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                        {isOverdue(t) && <AlertTriangle className="size-3 inline ml-1" />}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className={`px-5 py-3.5 font-bold text-right whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {isOverdue(t) ? (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencido</span>
                                                ) : t.status === 'paid' ? (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Pago</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pendente</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/financial/${t.id}/edit`} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                                                        <Edit className="size-4" />
                                                    </Link>
                                                    <button onClick={() => handleDelete(t)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                    <DollarSign className="size-6 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-base font-medium text-foreground">Nenhum lançamento</p>
                                                <p className="text-sm">Nenhuma transação encontrada para {monthNames[currentMonth - 1]} {currentYear}.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {transactions.total > 0 && (
                    <div className="mt-2">
                        <Pagination links={transactions.links} from={transactions.from} to={transactions.to} total={transactions.total} />
                    </div>
                )}
            </div>
            {modal}
        </AppLayout>
    );
}
