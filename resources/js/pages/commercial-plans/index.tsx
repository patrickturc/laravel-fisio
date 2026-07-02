import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';
import { useConfirmModal } from '@/components/confirm-modal';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';

interface CommercialPlan {
    id: string;
    name: string;
    price: string;
    duration_months: number | null;
    sessions_total: number | null;
    sessions_per_week: number | null;
    description: string | null;
    category: 'fisioterapia' | 'pilates' | 'teste';
}

export default function CommercialPlansIndex({ plans }: { plans: CommercialPlan[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planos Comerciais', href: '/commercial-plans' },
    ];

    const { can } = usePermissions();
    const { confirm, modal } = useConfirmModal();

    const handleDelete = async (plan: CommercialPlan) => {
        const confirmed = await confirm({
            title: 'Excluir Plano',
            message: `Tem certeza que deseja excluir o plano "${plan.name}"?`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) router.delete(`/commercial-plans/${plan.id}`);
    };

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        price: '',
        duration_months: '',
        sessions_total: '',
        sessions_per_week: '',
        description: '',
        category: 'fisioterapia',
    });

    const openCreateSheet = () => {
        setIsEditing(false);
        setEditingId(null);
        setData({
            name: '',
            price: '',
            duration_months: '',
            sessions_total: '',
            sessions_per_week: '',
            description: '',
            category: 'fisioterapia',
        });
        clearErrors();
        setSheetOpen(true);
    };

    const openEditSheet = (plan: CommercialPlan) => {
        setIsEditing(true);
        setEditingId(plan.id);
        setData({
            name: plan.name,
            price: plan.price,
            duration_months: plan.duration_months?.toString() || '',
            sessions_total: plan.sessions_total?.toString() || '',
            sessions_per_week: plan.sessions_per_week?.toString() || '',
            description: plan.description || '',
            category: plan.category || 'fisioterapia',
        });
        clearErrors();
        setSheetOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSheetOpen(false);
                reset();
            }
        };

        if (isEditing && editingId) {
            put(`/commercial-plans/${editingId}`, options);
        } else {
            post('/commercial-plans', options);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planos Comerciais - Phisio" />
            {modal}

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Planos e Pacotes</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os pacotes comerciais disponíveis para matrículas.</p>
                    </div>
                    {can('commercial_plans.manage.create') && (
                        <button
                            onClick={openCreateSheet}
                            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="size-4" />
                            Novo Plano
                        </button>
                    )}
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nome do Plano</th>
                                    <th className="px-6 py-4 font-medium">Valor Base</th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Duração Padrão</th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Sessões</th>
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
                                                    <div className="font-medium text-foreground flex items-center gap-2">
                                                        {plan.name}
                                                        <Badge variant="outline" className={
                                                            plan.category === 'fisioterapia' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                            plan.category === 'pilates' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                                            plan.category === 'teste' ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : ''
                                                        }>
                                                            {plan.category === 'fisioterapia' ? 'Fisioterapia' : plan.category === 'pilates' ? 'Pilates' : plan.category === 'teste' ? 'Aula Teste' : plan.category}
                                                        </Badge>
                                                    </div>
                                                    {plan.description && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{plan.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">
                                            R$ {parseFloat(plan.price).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                                            {plan.duration_months ? `${plan.duration_months} ${plan.duration_months === 1 ? 'mês' : 'meses'}` : 'Não definida'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                                            {plan.sessions_per_week
                                                ? `${plan.sessions_per_week}x/semana (${plan.sessions_per_week * 4}/mês)`
                                                : plan.sessions_total
                                                    ? `${plan.sessions_total} sessões`
                                                    : 'Ilimitado'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {can('commercial_plans.manage.edit') && (
                                                    <button
                                                        onClick={() => openEditSheet(plan)}
                                                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                )}
                                                {can('commercial_plans.manage.delete') && (
                                                    <button
                                                        onClick={() => handleDelete(plan)}
                                                        className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum plano comercial cadastrado. Clique em "Novo Plano" para começar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{isEditing ? 'Editar Plano Comercial' : 'Novo Plano Comercial'}</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Plano *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Ex: Pilates Mensal 2x Semana"
                                className="bg-background"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria *</Label>
                            <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                <SelectTrigger className="bg-background" id="category">
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                                    <SelectItem value="pilates">Pilates</SelectItem>
                                    <SelectItem value="teste">Aula Teste</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="price">Valor Base (R$) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                placeholder="0.00"
                                className="bg-background"
                                required
                            />
                            <InputError message={errors.price} />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="duration_months">Duração Padrão (Meses)</Label>
                            <Input
                                id="duration_months"
                                type="number"
                                min="1"
                                value={data.duration_months}
                                onChange={e => setData('duration_months', e.target.value)}
                                placeholder="Ex: 1 para mensal, 3 para trimestral"
                                className="bg-background"
                            />
                            <InputError message={errors.duration_months} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sessions_total">Sessões Incluídas</Label>
                            <Input
                                id="sessions_total"
                                type="number"
                                min="1"
                                value={data.sessions_total}
                                onChange={e => setData('sessions_total', e.target.value)}
                                placeholder="Deixe em branco para ilimitado"
                                className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">Total de sessões/aulas que o aluno pode usar durante a vigência. Em branco = ilimitado.</p>
                            <InputError message={errors.sessions_total} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sessions_per_week">Aulas por Semana</Label>
                            <Input
                                id="sessions_per_week"
                                type="number"
                                min="1"
                                max="7"
                                value={data.sessions_per_week}
                                onChange={e => setData('sessions_per_week', e.target.value)}
                                placeholder="Ex: 2 para 2x na semana"
                                className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">Frequência semanal. Usada para calcular a cota mensal de aulas (aulas/semana × 4). Em branco = sem cota.</p>
                            <InputError message={errors.sessions_per_week} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição / Regras</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Detalhes sobre o que está incluso..."
                                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-y"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/30">
                            <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90">
                                {processing ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Plano')}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
