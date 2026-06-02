import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface GroupClassFormSheetProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    groupClass?: any;
    patients?: any[];
    users?: Array<{ id: number; name: string }>;
}

export function GroupClassFormSheet({ isOpen, setIsOpen, groupClass, patients = [], users = [] }: GroupClassFormSheetProps) {
    const isEditMode = !!groupClass;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: groupClass?.name || '',
        user_id: groupClass?.user_id || '',
        max_participants: groupClass?.max_participants || 4,
        status: groupClass?.status || 'active',
        schedules: groupClass?.schedules || [{ day_of_week: 1, start_time: '08:00', duration_minutes: 50 }],
        patient_ids: groupClass?.patients?.map((p: any) => p.id) || [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (!isEditMode) {
                reset();
            } else {
                setData({
                    name: groupClass.name,
                    user_id: groupClass.user_id || '',
                    max_participants: groupClass.max_participants,
                    status: groupClass.status,
                    schedules: groupClass.schedules,
                    patient_ids: groupClass.patients?.map((p: any) => p.id) || [],
                });
            }
        }
    }, [isOpen, groupClass]);

    const addSchedule = () => {
        setData('schedules', [
            ...data.schedules,
            { day_of_week: 1, start_time: '08:00', duration_minutes: 50 }
        ]);
    };

    const removeSchedule = (index: number) => {
        const newSchedules = [...data.schedules];
        newSchedules.splice(index, 1);
        setData('schedules', newSchedules);
    };

    const updateSchedule = (index: number, field: string, value: any) => {
        const newSchedules = [...data.schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setData('schedules', newSchedules);
    };

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        if (isEditMode) {
            put(`/group-classes/${groupClass.id}`, {
                onSuccess: () => setIsOpen(false)
            });
        } else {
            post('/group-classes', {
                onSuccess: () => setIsOpen(false)
            });
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto border-l-border/50">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">{isEditMode ? 'Editar Turma' : 'Nova Turma'}</SheetTitle>
                    <SheetDescription>
                        {isEditMode ? 'Edite os dados desta turma.' : 'Defina os horários base em que essa turma ocorre.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nome da Turma *</Label>
                        <Input
                            placeholder="ex: Pilates T/Q 08:00"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="bg-background"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user_id">Profissional Responsável</Label>
                        <select 
                            id="user_id"
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="bg-background h-10 w-full text-sm rounded-md border-border/50 focus:ring-primary/20 focus:border-primary px-3"
                        >
                            <option value="">-- Selecione (Padrão: Você) --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.user_id as string} />
                    </div>

                    <div className="space-y-2">
                        <Label>Máximo de Participantes *</Label>
                        <Input
                            type="number"
                            min="1"
                            value={data.max_participants}
                            onChange={(e) => setData('max_participants', parseInt(e.target.value) || 1)}
                        />
                        <InputError message={errors.max_participants} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Alunos da Turma ({data.patient_ids.length}/{data.max_participants})</Label>
                        <div className="max-h-[160px] overflow-y-auto border border-border/50 rounded-lg p-2 bg-muted/20 grid grid-cols-1 gap-1">
                            {patients.map(p => (
                                <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-background rounded-md cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        name="patients"
                                        value={p.id}
                                        checked={data.patient_ids.includes(p.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                if (data.patient_ids.length < data.max_participants) {
                                                    setData('patient_ids', [...data.patient_ids, p.id]);
                                                }
                                            } else {
                                                setData('patient_ids', data.patient_ids.filter((id: string) => id !== p.id));
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

                    <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <CalendarClock className="size-4" /> Horários Base
                                </Label>
                                <Button type="button" variant="outline" size="sm" onClick={addSchedule} className="gap-2 rounded-xl text-xs h-8">
                                    <Plus className="size-3" /> Adicionar
                                </Button>
                            </div>
                            
                            {isEditMode && (
                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 p-3 rounded-xl text-xs leading-relaxed mb-4">
                                    <strong>Atenção:</strong> Alterar os horários aqui dita as regras apenas para <strong>novas aulas</strong> criadas ao clicar em "Gerar Aulas". Para mudar de vez o horário de várias aulas que <strong>já estão na agenda</strong>, vá na Agenda, arraste uma aula e escolha "Esta e as Próximas".
                                </div>
                            )}
                            
                            {data.schedules.map((schedule: any, index: number) => (
                                <div key={index} className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-4 relative group">
                                    {data.schedules.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeSchedule(index)}
                                            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                    
                                    <div className="space-y-2 pr-8">
                                        <Label className="text-xs">Dia da Semana</Label>
                                        <Select 
                                            value={schedule.day_of_week.toString()} 
                                            onValueChange={(val) => updateSchedule(index, 'day_of_week', parseInt(val))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Domingo</SelectItem>
                                                <SelectItem value="1">Segunda-feira</SelectItem>
                                                <SelectItem value="2">Terça-feira</SelectItem>
                                                <SelectItem value="3">Quarta-feira</SelectItem>
                                                <SelectItem value="4">Quinta-feira</SelectItem>
                                                <SelectItem value="5">Sexta-feira</SelectItem>
                                                <SelectItem value="6">Sábado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Horário Inicial</Label>
                                            <Input
                                                type="time"
                                                value={schedule.start_time}
                                                onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Duração (min)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={schedule.duration_minutes}
                                                onChange={(e) => updateSchedule(index, 'duration_minutes', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    <div className="pt-4 flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditMode ? 'Salvar Alterações' : 'Criar Turma'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
