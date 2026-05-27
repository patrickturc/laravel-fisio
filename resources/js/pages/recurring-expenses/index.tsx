import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, RefreshCw, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConfirmModal } from '@/components/confirm-modal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const expenseCategories = ['Aluguel', 'Equipamentos', 'Material', 'Água/Luz/Internet', 'Salários', 'Impostos', 'Marketing', 'Manutenção', 'Outros'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Financeiro', href: '/financial' },
    { title: 'Gastos Recorrentes', href: '/recurring-expenses' },
];

interface RecurringExpense {
    id: string;
    description: string;
    amount: string;
    category: string | null;
    recurrence: 'monthly' | 'quarterly' | 'yearly';
    day_of_month: number;
    is_active: boolean;
    last_generated_at: string | null;
}

const recurrenceLabels: Record<string, string> = { monthly: 'Mensal', quarterly: 'Trimestral', yearly: 'Anual' };

const formatCurrency = (val: string | number) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function RecurringExpenseIndex({ expenses }: { expenses: RecurringExpense[] }) {
    const { confirm, modal } = useConfirmModal();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        description: '',
        amount: '',
        category: '',
        recurrence: 'monthly',
        day_of_month: 5,
        is_active: true,
    });

    function openCreate() {
        setEditingId(null);
        reset();
        clearErrors();
        setSheetOpen(true);
    }

    function openEdit(expense: RecurringExpense) {
        setEditingId(expense.id);
        setData({
            description: expense.description,
            amount: expense.amount,
            category: expense.category || '',
            recurrence: expense.recurrence,
            day_of_month: expense.day_of_month,
            is_active: expense.is_active,
        });
        clearErrors();
        setSheetOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editingId) {
            put(`/recurring-expenses/${editingId}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSheetOpen(false)
            });
        } else {
            post('/recurring-expenses', {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSheetOpen(false)
            });
        }
    }

    async function handleDelete(expense: RecurringExpense) {
        const confirmed = await confirm({
            title: 'Excluir Gasto Recorrente',
            message: `Tem certeza que deseja excluir "${expense.description}"? Transações já geradas não serão afetadas.`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/recurring-expenses/${expense.id}`);
    }

    function toggleActive(expense: RecurringExpense) {
        router.post(`/recurring-expenses/${expense.id}/toggle-active`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gastos Recorrentes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gastos Recorrentes</h1>
                        <p className="text-muted-foreground text-sm mt-1">Despesas fixas que são geradas automaticamente todo mês.</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                        <Plus className="size-4" /> Novo Gasto
                    </button>
                </div>

                {expenses.length > 0 ? (
                    <div className="grid gap-3">
                        {expenses.map((expense, i) => (
                            <motion.div key={expense.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-4 p-5 rounded-2xl border shadow-sm transition-colors ${expense.is_active ? 'bg-card/60 backdrop-blur-xl border-border/50' : 'bg-muted/30 border-border/30 opacity-60'}`}>
                                
                                <div className="p-2.5 rounded-xl bg-red-500/10">
                                    <RefreshCw className="size-5 text-red-500" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">{expense.description}</span>
                                        {!expense.is_active && <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Inativo</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        {expense.category && <span>{expense.category}</span>}
                                        <span>•</span>
                                        <span>Todo dia {expense.day_of_month}</span>
                                        <span>•</span>
                                        <span>{recurrenceLabels[expense.recurrence]}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleActive(expense)}
                                        className={`p-2 rounded-xl transition-colors ${expense.is_active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-500/10'}`}
                                        title={expense.is_active ? 'Desativar' : 'Ativar'}>
                                        {expense.is_active ? <Power className="size-4" /> : <PowerOff className="size-4" />}
                                    </button>
                                    <button onClick={() => openEdit(expense)}
                                        className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-colors">
                                        <Edit className="size-4" />
                                    </button>
                                    <button onClick={() => handleDelete(expense)}
                                        className="p-2 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-12 text-center shadow-sm">
                        <RefreshCw className="size-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-lg font-medium text-foreground">Nenhum gasto recorrente</p>
                        <p className="text-sm text-muted-foreground mt-1">Cadastre despesas fixas como aluguel, luz e internet.</p>
                        <button onClick={openCreate} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">
                            <Plus className="size-4" /> Cadastrar Primeiro Gasto
                        </button>
                    </div>
                )}
            </div>
            {modal}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-5">
                        <SheetTitle>{editingId ? 'Editar Gasto Recorrente' : 'Novo Gasto Recorrente'}</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição *</label>
                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" placeholder="Ex: Aluguel, Conta de Luz, Internet" />
                            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Valor (R$) *</label>
                                <input type="number" step="0.01" min="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                    className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" placeholder="0,00" />
                                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Categoria</label>
                                <select value={data.category} onChange={e => setData('category', e.target.value)}
                                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm">
                                    <option value="">Selecione...</option>
                                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Dia do Mês *</label>
                                <input type="number" min={1} max={31} value={data.day_of_month} onChange={e => setData('day_of_month', parseInt(e.target.value) || 1)}
                                    className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                                <p className="text-xs text-muted-foreground mt-1">Todo dia {data.day_of_month} será gerada uma despesa pendente.</p>
                                {errors.day_of_month && <p className="text-xs text-red-500 mt-1">{errors.day_of_month}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Recorrência</label>
                                <select value={data.recurrence} onChange={e => setData('recurrence', e.target.value)}
                                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm">
                                    <option value="monthly">Mensal</option>
                                    <option value="quarterly">Trimestral</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                        </div>

                        {editingId && (
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                                <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                    className="size-4 rounded border-border text-primary focus:ring-primary" />
                                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                                    Gasto ativo
                                    <span className="text-muted-foreground font-normal ml-1">— quando desativado, não gera novas despesas</span>
                                </label>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={processing}
                                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                                {editingId ? 'Salvar Alterações' : 'Cadastrar Gasto'}
                            </button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
