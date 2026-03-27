import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pacientes', href: '/patients' },
    { title: 'Novo Paciente', href: '/patients/create' },
];

export default function PatientCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        birthdate: '',
        phone: '',
        type: 'physiotherapy' as 'pilates' | 'physiotherapy',
        cpf: '',
        address: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/patients');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Paciente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/patients" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Preencha os dados abaixo para cadastrar um paciente.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Maria da Silva" className="bg-neutral-50 border-neutral-200" required />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="birthdate">Data de Nascimento</Label>
                            <Input id="birthdate" type="date" value={data.birthdate} onChange={e => setData('birthdate', e.target.value)} className="bg-neutral-50 border-neutral-200" />
                            <InputError message={errors.birthdate} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="(11) 99999-9999" className="bg-neutral-50 border-neutral-200" />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" value={data.cpf} onChange={e => setData('cpf', e.target.value)} placeholder="000.000.000-00" className="bg-neutral-50 border-neutral-200" />
                            <InputError message={errors.cpf} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo de atendimento *</Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={e => setData('type', e.target.value as 'pilates' | 'physiotherapy')}
                                className="flex h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="physiotherapy">Fisioterapia</option>
                                <option value="pilates">Pilates</option>
                            </select>
                            <InputError message={errors.type} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Rua, número, bairro, cidade" className="bg-neutral-50 border-neutral-200" />
                        <InputError message={errors.address} />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/30">
                        <Link href="/patients" className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            Cancelar
                        </Link>
                        <Button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90">
                            {processing ? 'Salvando...' : 'Cadastrar Paciente'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
