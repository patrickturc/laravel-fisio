import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Save, ArrowLeft, Tag, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { FormEvent } from 'react';

export default function MembershipCreate({ patients, commercialPlans, selectedPatientId }: { patients: any[]; commercialPlans: any[]; selectedPatientId?: string }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Matrículas', href: '/memberships' },
        { title: 'Nova Matrícula', href: '/memberships/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        patient_id: selectedPatientId || '',
        commercial_plan_id: '',
        plan_name: '', // Kept for backwards compatibility or custom plans
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        price: '',
        status: 'active',
    });

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
                plan_name: selectedPlan.name // Store name just in case
            }));
        } else {
            setData('commercial_plan_id', '');
        }
    };

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/memberships');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nova Matrícula - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                
                <div className="flex items-center gap-4">
                    <Link href="/memberships" className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                        <ArrowLeft className="size-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Matrícula</h1>
                        <p className="text-muted-foreground mt-1">Crie um novo plano ou pacote para o aluno.</p>
                    </div>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6 md:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
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
                                        value={data.commercial_plan_id}
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

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">Valor do Plano (R$)</label>
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
                        </div>

                        <div className="pt-6 border-t border-border/50 flex justify-end gap-3">
                            <Link 
                                href="/memberships"
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
                                Salvar Matrícula
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
