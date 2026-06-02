import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Users, User, Trash2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface AppointmentFormSheetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    patients: Array<{ id: string; name: string }>;
    editingAppointment?: any; // If provided, it's edit mode
    initialDate?: string;
    initialTime?: string;
    initialDuration?: number;
    initialPatientId?: string;
    users?: Array<{ id: number; name: string }>;
    groupClasses?: Array<{ id: string; name: string; max_participants: number }>;
    onNewGroupClass?: () => void;
}

export function AppointmentFormSheet({
    isOpen,
    setIsOpen,
    patients,
    editingAppointment,
    initialDate,
    initialTime,
    initialDuration,
    initialPatientId,
    users = [],
    groupClasses = [],
    onNewGroupClass
}: AppointmentFormSheetProps) {
    const isEditMode = !!editingAppointment;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        type: 'individual',
        title: '',
        user_id: '',
        group_class_id: '',
        max_participants: 1,
        patient_ids: initialPatientId ? [initialPatientId] : ([] as string[]),
        appointment_date: initialDate || new Date().toISOString().split('T')[0],
        start_time: initialTime || '08:00',
        duration_minutes: initialDuration ? String(initialDuration) : '50',
        status: 'scheduled',
        notes: '',
        is_recurring: false,
        recurrence_end_date: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (editingAppointment) {
                setData({
                    type: editingAppointment.type || 'individual',
                    title: editingAppointment.title || '',
                    user_id: editingAppointment.user_id || '',
                    group_class_id: editingAppointment.group_class_id || '',
                    max_participants: editingAppointment.max_participants || 1,
                    patient_ids: editingAppointment.patients ? editingAppointment.patients.map((p: any) => p.id) : [],
                    appointment_date: editingAppointment.appointment_date?.slice(0, 10) || '',
                    start_time: editingAppointment.start_time?.slice(0, 5) || '',
                    duration_minutes: String(editingAppointment.duration_minutes),
                    status: editingAppointment.status || 'scheduled',
                    notes: editingAppointment.notes || '',
                    is_recurring: false,
                    recurrence_end_date: '',
                });
            } else {
                setData({
                    type: 'individual',
                    title: '',
                    user_id: '',
                    group_class_id: '',
                    max_participants: 1,
                    patient_ids: initialPatientId ? [initialPatientId] : [],
                    appointment_date: initialDate || new Date().toISOString().split('T')[0],
                    start_time: initialTime || '08:00',
                    duration_minutes: initialDuration ? String(initialDuration) : '50',
                    status: 'scheduled',
                    notes: '',
                    is_recurring: false,
                    recurrence_end_date: '',
                });
            }
        }
    }, [isOpen, editingAppointment, initialDate, initialTime, initialDuration]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsOpen(false);
            }
        };

        if (isEditMode) {
            put(`/appointments/${editingAppointment.id}`, options);
        } else {
            post('/appointments', options);
        }
    }

    function handleDelete() {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            router.delete(`/appointments/${editingAppointment.id}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setIsOpen(false)
            });
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="overflow-y-auto sm:max-w-lg w-full">
                <SheetHeader className="mb-4">
                    <SheetTitle>{isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}</SheetTitle>
                    <SheetDescription>
                        {isEditMode 
                            ? 'Edite as informações deste agendamento.' 
                            : 'Preencha os dados abaixo para criar um novo agendamento.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 w-fit">
                        <button
                            type="button"
                            onClick={() => { setData(d => ({ ...d, type: 'individual', max_participants: 1, title: '', patient_ids: d.patient_ids.length > 0 ? [d.patient_ids[0]] : [] })); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${data.type === 'individual' ? 'bg-background shadow-sm text-primary border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <User className="size-4" />
                            Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => { setData('type', 'group'); setData('max_participants', Math.max(4, data.patient_ids.length)); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${data.type === 'group' ? 'bg-background shadow-sm text-primary border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <Users className="size-4" />
                            Turma
                        </button>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="user_id" className="text-xs">Profissional Responsável</Label>
                        <select 
                            id="user_id"
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="bg-background h-8 text-sm rounded-md border-border/50 focus:ring-primary/20 focus:border-primary"
                        >
                            <option value="">-- Selecione (Padrão: Você) --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.user_id} className="text-[10px]" />
                    </div>

                    {data.type === 'group' && (
                        <div className="grid grid-cols-1 gap-4 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                            <div className="grid gap-1.5">
                                <Label htmlFor="group_class_id" className="text-xs">Turma *</Label>
                                <div className="flex items-center gap-2">
                                    <select 
                                        id="group_class_id"
                                        value={data.group_class_id}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData('group_class_id', val);
                                            if (val) {
                                                const gc = groupClasses.find(g => g.id === val);
                                                if (gc) {
                                                    setData(d => ({...d, group_class_id: val, title: gc.name, max_participants: gc.max_participants}));
                                                }
                                            }
                                        }}
                                        className="bg-background h-8 text-sm rounded-md border-border/50 focus:ring-primary/20 focus:border-primary flex-1"
                                        required={data.type === 'group'}
                                    >
                                        <option value="">-- Selecione uma Turma --</option>
                                        {groupClasses.map(gc => (
                                            <option key={gc.id} value={gc.id}>{gc.name} ({gc.max_participants} vagas)</option>
                                        ))}
                                    </select>
                                    {onNewGroupClass && (
                                        <Button type="button" onClick={onNewGroupClass} variant="outline" className="h-8 px-3 text-xs gap-1">
                                            <Plus className="size-3" /> Nova Turma
                                        </Button>
                                    )}
                                </div>
                                <InputError message={errors.group_class_id} className="text-[10px]" />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>Pacientes {data.type === 'group' ? `(${data.patient_ids.length}/${data.max_participants})` : '*'}</Label>
                        <div className="max-h-[160px] overflow-y-auto border border-border/50 rounded-lg p-2 bg-muted/20 grid grid-cols-1 gap-1">
                            {[...patients].sort((a, b) => {
                                const aSelected = data.patient_ids.includes(a.id);
                                const bSelected = data.patient_ids.includes(b.id);
                                if (aSelected && !bSelected) return -1;
                                if (!aSelected && bSelected) return 1;
                                return a.name.localeCompare(b.name);
                            }).map(p => (
                                <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-background rounded-md cursor-pointer transition-colors">
                                    <input
                                        type={data.type === 'individual' ? 'radio' : 'checkbox'}
                                        name="patients"
                                        value={p.id}
                                        checked={data.patient_ids.includes(p.id)}
                                        onChange={(e) => {
                                            if (data.type === 'individual') {
                                                setData('patient_ids', [p.id]);
                                            } else {
                                                if (e.target.checked) {
                                                    if (data.patient_ids.length < data.max_participants) {
                                                        setData('patient_ids', [...data.patient_ids, p.id]);
                                                    }
                                                } else {
                                                    setData('patient_ids', data.patient_ids.filter(id => id !== p.id));
                                                }
                                            }
                                        }}
                                        className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium">{p.name}</span>
                                </label>
                            ))}
                            {patients.length === 0 && (
                                <div className="text-xs text-muted-foreground text-center py-2">Nenhum paciente.</div>
                            )}
                        </div>
                        <InputError message={errors.patient_ids as string} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="appointment_date" className="text-xs">Data *</Label>
                            <Input id="appointment_date" type="date" value={data.appointment_date} onChange={e => setData('appointment_date', e.target.value)} className="h-8 text-sm" required />
                            <InputError message={errors.appointment_date} className="text-[10px]" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="start_time" className="text-xs">Horário *</Label>
                            <Input id="start_time" type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="h-8 text-sm" required />
                            <InputError message={errors.start_time} className="text-[10px]" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="duration_minutes" className="text-xs">Minutos *</Label>
                            <Input id="duration_minutes" type="number" value={data.duration_minutes} onChange={e => setData('duration_minutes', e.target.value)} className="h-8 text-sm" min="10" max="180" required />
                            <InputError message={errors.duration_minutes} className="text-[10px]" />
                        </div>
                    </div>

                    {!isEditMode && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    checked={data.is_recurring}
                                    onChange={e => setData('is_recurring', e.target.checked)}
                                    className="size-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="is_recurring" className="text-sm font-semibold cursor-pointer">Repetir semanalmente?</Label>
                            </div>
                            
                            {data.is_recurring && (
                                <div className="grid gap-1.5 pl-6">
                                    <Label htmlFor="recurrence_end_date" className="text-xs">Até qual data? *</Label>
                                    <Input 
                                        id="recurrence_end_date" 
                                        type="date" 
                                        value={data.recurrence_end_date} 
                                        onChange={e => setData('recurrence_end_date', e.target.value)} 
                                        className="h-8 text-sm" 
                                        min={data.appointment_date || new Date().toISOString().split('T')[0]}
                                        required={data.is_recurring}
                                    />
                                    <InputError message={errors.recurrence_end_date} className="text-[10px]" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-1.5">
                        <Label htmlFor="status" className="text-xs">Status</Label>
                        <select id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="scheduled">Agendado</option>
                            <option value="completed">Realizado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="notes" className="text-xs">Observações</Label>
                        <textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px] resize-y" placeholder="..." />
                        <InputError message={errors.notes} className="text-[10px]" />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        {isEditMode ? (
                            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                                <Trash2 className="size-4" />
                                Excluir
                            </Button>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button type="submit" size="sm" disabled={processing}>
                                {processing ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
