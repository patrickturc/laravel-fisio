import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecurringExpense {
    id: string;
    description: string;
    amount: string;
    category: string | null;
    recurrence: string;
    day_of_month: number;
    is_active: boolean;
}

const expenseCategories = ['Aluguel', 'Equipamentos', 'Material', 'Água/Luz/Internet', 'Salários', 'Impostos', 'Marketing', 'Manutenção', 'Outros'];

export default function RecurringExpenseEdit({ expense }: { expense: RecurringExpense }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financeiro', href: '/financial' },
        { title: 'Gastos Recorrentes', href: '/recurring-expenses' },
        { title: expense.description, href: `/recurring-expenses/${expense.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        description: expense.description,
        amount: expense.amount,
        category: expense.category || '',
        recurrence: expense.recurrence,
        day_of_month: expense.day_of_month,
        is_active: expense.is_active,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/recurring-expenses/${expense.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar - ${expense.description}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/recurring-expenses" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground"><ArrowLeft className="size-5" /></Link>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Gasto Recorrente</h1>
                </div>

                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-sm space-y-5">
                    
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição *</label>
                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Valor (R$) *</label>
                            <input type="number" step="0.01" min="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                className="w-full h-11 px-4 border border-border rounded-xl bg-background text-sm" />
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

                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                            className="size-4 rounded border-border text-primary focus:ring-primary" />
                        <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                            Gasto ativo
                            <span className="text-muted-foreground font-normal ml-1">— quando desativado, não gera novas despesas</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={processing}
                            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                            Salvar Alterações
                        </button>
                    </div>
                </motion.form>
            </div>
        </AppLayout>
    );
}
