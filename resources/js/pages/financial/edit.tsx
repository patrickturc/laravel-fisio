import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Save, ArrowLeft, AlignLeft, Calendar as CalendarIcon, DollarSign, Tag, User, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { useConfirmModal } from '@/components/confirm-modal';

const incomeCategories = ['Mensalidade', 'Avaliação', 'Sessão Avulsa', 'Matrícula', 'Outros'];
const expenseCategories = ['Aluguel', 'Equipamentos', 'Material', 'Água/Luz/Internet', 'Salários', 'Impostos', 'Marketing', 'Manutenção', 'Outros'];

export default function FinancialEdit({ transaction, patients }: { transaction: any; patients: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financeiro', href: '/financial' },
        { title: 'Editar Lançamento', href: `/financial/${transaction.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        type: transaction.type || 'income',
        amount: transaction.amount || '',
        date: transaction.date ? transaction.date.split('T')[0] : '',
        description: transaction.description || '',
        category: transaction.category || '',
        status: transaction.status || 'paid',
        patient_id: transaction.patient_id || '',
        due_date: transaction.due_date ? transaction.due_date.split('T')[0] : '',
        paid_at: transaction.paid_at ? transaction.paid_at.split('T')[0] : '',
    });

    const { confirm, modal } = useConfirmModal();

    const categories = data.type === 'income' ? incomeCategories : expenseCategories;

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/financial/${transaction.id}`);
    }

    async function handleDelete() {
        const confirmed = await confirm({
            title: 'Excluir Lançamento',
            message: `Tem certeza que deseja excluir "${transaction.description}"? Essa ação não pode ser desfeita.`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/financial/${transaction.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Lançamento - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/financial" className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                            <ArrowLeft className="size-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Lançamento</h1>
                            <p className="text-muted-foreground mt-1">Atualize os dados da transação.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 h-10 px-4 border border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                    >
                        <Trash2 className="size-4" />
                        <span className="hidden sm:inline">Excluir</span>
                    </button>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6 md:p-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Tipo de Transação */}
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-2 rounded-xl">
                            <button
                                type="button"
                                onClick={() => { setData('type', 'income'); setData('category', ''); }}
                                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${data.type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600'}`}
                            >
                                Receita (+)
                            </button>
                            <button
                                type="button"
                                onClick={() => { setData('type', 'expense'); setData('category', ''); }}
                                className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${data.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-600'}`}
                            >
                                Despesa (-)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">Valor (R$)</label>
                                <div className="relative">
                                    <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${data.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full h-14 pl-12 pr-3 text-2xl font-bold border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">Descrição</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Ex: Mensalidade Pilates, Luz, Água, etc..."
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Data</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        required
                                    />
                                </div>
                                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Categoria</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <select
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm appearance-none"
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full h-11 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                    required
                                >
                                    <option value="paid">{data.type === 'income' ? 'Recebido' : 'Pago'}</option>
                                    <option value="pending">Pendente (A receber / A pagar)</option>
                                </select>
                                {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                            </div>

                            {data.status === 'pending' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Data de Vencimento</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <input
                                            type="date"
                                            value={data.due_date}
                                            onChange={e => setData('due_date', e.target.value)}
                                            className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        />
                                    </div>
                                    {errors.due_date && <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>}
                                </div>
                            )}

                            {data.type === 'income' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Vincular Paciente / Aluno (Opcional)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <select
                                            value={data.patient_id}
                                            onChange={e => setData('patient_id', e.target.value)}
                                            className="w-full h-11 pl-10 pr-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                        >
                                            <option value="">Nenhum</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.patient_id && <p className="text-sm text-red-500 mt-1">{errors.patient_id}</p>}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                            <Link
                                href="/financial"
                                className="h-11 px-6 flex items-center justify-center border border-border bg-card hover:bg-muted text-foreground font-medium rounded-xl transition-colors shadow-sm"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="h-11 px-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Save className="size-4" />
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {modal}
        </AppLayout>
    );
}
