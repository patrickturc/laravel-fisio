import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useForm, router } from '@inertiajs/react';
import { Tag, Calendar as CalendarIcon, DollarSign, Save } from 'lucide-react';
import { useEffect, FormEvent } from 'react';

interface MembershipFormSheetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    patients: any[];
    commercialPlans: any[];
    editingMembership?: any;
    initialPatientId?: string;
}

export function MembershipFormSheet({
    isOpen,
    setIsOpen,
    patients,
    commercialPlans,
    editingMembership,
    initialPatientId
}: MembershipFormSheetProps) {
    const isEditMode = !!editingMembership;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        patient_id: initialPatientId || '',
        commercial_plan_id: '',
        plan_name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        price: '',
        status: 'active',
        billing_day: 10,
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingMembership) {
                setData({
                    patient_id: editingMembership.patient_id || '',
                    commercial_plan_id: editingMembership.commercial_plan_id || '',
                    plan_name: editingMembership.plan_name || '',
                    start_date: editingMembership.start_date ? editingMembership.start_date.split('T')[0] : '',
                    end_date: editingMembership.end_date ? editingMembership.end_date.split('T')[0] : '',
                    price: editingMembership.price || '',
                    status: editingMembership.status || 'active',
                    billing_day: editingMembership.billing_day || 10,
                });
            } else {
                setData({
                    patient_id: initialPatientId || '',
                    commercial_plan_id: '',
                    plan_name: '',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                    price: '',
                    status: 'active',
                    billing_day: 10,
                });
            }
        }
    }, [isOpen, editingMembership, initialPatientId]);

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
                setIsOpen(false);
                reset();
            }
        };

        if (isEditMode) {
            put(`/memberships/${editingMembership.id}`, options);
        } else {
            post('/memberships', options);
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto border-l-border/50">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditMode ? 'Editar Matrícula' : 'Nova Matrícula'}
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                        {isEditMode ? 'Atualize os dados do plano do aluno.' : 'Crie um novo plano ou pacote para o aluno.'}
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
                            disabled={!!initialPatientId} // se vier do perfil do paciente, bloqueia o select
                        >
                            <option value="">Selecione o aluno...</option>
                            {patients.map((p: any) => (
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
                                {commercialPlans.map((p: any) => (
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            onClick={() => setIsOpen(false)}
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
                            {isEditMode ? 'Salvar Alterações' : 'Salvar Matrícula'}
                        </button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
