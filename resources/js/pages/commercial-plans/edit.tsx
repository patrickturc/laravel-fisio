import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function CommercialPlansEdit({ plan }: { plan: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Planos Comerciais', href: '/commercial-plans' },
        { title: plan.name, href: `/commercial-plans/${plan.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: plan.name,
        price: plan.price,
        duration_months: plan.duration_months || '',
        description: plan.description || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/commercial-plans/${plan.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${plan.name} - Phisio`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/commercial-plans" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Plano Comercial</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{plan.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome do Plano *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="bg-background"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Valor Base (R$) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
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
                                className="bg-background"
                            />
                            <InputError message={errors.duration_months} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição / Regras</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-y"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/30">
                        <Link href="/commercial-plans" className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Cancelar</Link>
                        <Button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90">
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
