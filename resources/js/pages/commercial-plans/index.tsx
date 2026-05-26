import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';
import { useConfirmModal, ConfirmModal } from '@/components/confirm-modal';

interface CommercialPlan {
    id: string;
    name: string;
    price: string;
    duration_months: number | null;
    description: string | null;
}

export default function CommercialPlansIndex({ plans }: { plans: CommercialPlan[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planos Comerciais', href: '/commercial-plans' },
    ];

    const confirm = useConfirmModal();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planos Comerciais - Phisio" />
            <ConfirmModal {...confirm} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Planos e Pacotes</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os pacotes comerciais disponíveis para matrículas.</p>
                    </div>
                    <Link
                        href="/commercial-plans/create"
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" />
                        Novo Plano
                    </Link>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nome do Plano</th>
                                    <th className="px-6 py-4 font-medium">Valor Base</th>
                                    <th className="px-6 py-4 font-medium">Duração Padrão</th>
                                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                    <Tag className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{plan.name}</div>
                                                    {plan.description && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{plan.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                                            R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {plan.duration_months ? `${plan.duration_months} ${plan.duration_months === 1 ? 'mês' : 'meses'}` : 'Não definida'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/commercial-plans/${plan.id}/edit`}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="size-4" />
                                                </Link>
                                                <button
                                                    onClick={() => confirm.open({
                                                        title: 'Excluir Plano',
                                                        message: 'Tem certeza que deseja excluir este plano comercial?',
                                                        onConfirm: () => router.delete(`/commercial-plans/${plan.id}`),
                                                    })}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum plano comercial cadastrado. Clique em "Novo Plano" para começar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
