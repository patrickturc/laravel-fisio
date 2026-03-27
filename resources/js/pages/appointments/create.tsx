import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Agenda', href: '/appointments' },
    { title: 'Novo Agendamento', href: '/appointments/create' },
];

interface Props {
    patients: Array<{ id: string; name: string }>;
    selectedPatientId?: string | null;
}

export default function AppointmentCreate({ patients, selectedPatientId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: selectedPatientId || '',
        appointment_date: '',
        start_time: '',
        duration_minutes: '50',
        status: 'scheduled',
        notes: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/appointments');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Agendamento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/appointments" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"><ArrowLeft className="size-5" /></Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Novo Agendamento</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Agende uma sessão para um paciente.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">Paciente *</Label>
                        <select id="patient_id" value={data.patient_id} onChange={e => setData('patient_id', e.target.value)} className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                            <option value="">Selecione um paciente</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <InputError message={errors.patient_id} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="appointment_date">Data *</Label>
                            <Input id="appointment_date" type="date" value={data.appointment_date} onChange={e => setData('appointment_date', e.target.value)} className="bg-neutral-50 border-neutral-200" required />
                            <InputError message={errors.appointment_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="start_time">Horário *</Label>
                            <Input id="start_time" type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="bg-neutral-50 border-neutral-200" required />
                            <InputError message={errors.start_time} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="duration_minutes">Duração (min) *</Label>
                            <Input id="duration_minutes" type="number" value={data.duration_minutes} onChange={e => setData('duration_minutes', e.target.value)} className="bg-neutral-50 border-neutral-200" min="10" max="180" required />
                            <InputError message={errors.duration_minutes} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select id="status" value={data.status} onChange={e => setData('status', e.target.value)} className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <option value="scheduled">Agendado</option>
                            <option value="completed">Realizado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Observações</Label>
                        <textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} className="flex w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px] resize-y" placeholder="Observações sobre a sessão..." />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/30">
                        <Link href="/appointments" className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Cancelar</Link>
                        <Button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90">
                            {processing ? 'Salvando...' : 'Criar Agendamento'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
