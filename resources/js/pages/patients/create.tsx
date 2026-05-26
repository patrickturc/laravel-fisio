import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeft, User, Phone, Mail, MapPin, Shield, Heart, Briefcase } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pacientes', href: '/patients' },
    { title: 'Novo Paciente', href: '/patients/create' },
];

export default function PatientCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nickname: '',
        birthdate: '',
        gender: '',
        phone: '',
        email: '',
        type: 'pilates' as 'pilates' | 'physiotherapy',
        cpf: '',
        rg: '',
        profession: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        health_notes: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/patients');
    }

    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedCep = maskCEP(e.target.value);
        setData('cep', maskedCep);

        if (maskedCep.length === 9) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${maskedCep.replace('-', '')}/json/`);
                const json = await response.json();
                if (!json.erro) {
                    setData(data => ({
                        ...data,
                        street: json.logradouro || data.street,
                        neighborhood: json.bairro || data.neighborhood,
                        city: json.localidade || data.city,
                        state: json.uf || data.state,
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Novo Paciente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/patients" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Preencha os dados abaixo para cadastrar um paciente.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Dados Pessoais ── */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base mb-1">
                            <User className="size-5 text-primary" />
                            Dados Pessoais
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome completo *</Label>
                            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Maria da Silva" className="bg-background" required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="nickname">Nome curto (apelido)</Label>
                                <Input id="nickname" value={data.nickname} onChange={e => setData('nickname', e.target.value)} placeholder="Ex: Maria" className="bg-background" />
                                <InputError message={errors.nickname} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="birthdate">Data de Nascimento</Label>
                                <Input id="birthdate" type="date" value={data.birthdate} onChange={e => setData('birthdate', e.target.value)} className="bg-background" />
                                <InputError message={errors.birthdate} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Sexo</Label>
                                <select id="gender" value={data.gender} onChange={e => setData('gender', e.target.value)} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="">Não informado</option>
                                    <option value="female">Feminino</option>
                                    <option value="male">Masculino</option>
                                    <option value="other">Outro</option>
                                </select>
                                <InputError message={errors.gender} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input id="cpf" value={data.cpf} onChange={e => setData('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} className="bg-background" />
                                <InputError message={errors.cpf} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rg">RG</Label>
                                <Input id="rg" value={data.rg} onChange={e => setData('rg', e.target.value)} placeholder="Informe o RG" className="bg-background" />
                                <InputError message={errors.rg} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="profession">Profissão</Label>
                                <Input id="profession" value={data.profession} onChange={e => setData('profession', e.target.value)} placeholder="Ex: Professora" className="bg-background" />
                                <InputError message={errors.profession} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo de atendimento *</Label>
                                <select id="type" value={data.type} onChange={e => setData('type', e.target.value as 'pilates' | 'physiotherapy')} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="pilates">Pilates</option>
                                    <option value="physiotherapy">Fisioterapia</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>
                        </div>
                    </div>

                    {/* ── Contato ── */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base mb-1">
                            <Phone className="size-5 text-primary" />
                            Contato
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', maskPhone(e.target.value))} placeholder="(11) 99999-9999" maxLength={15} className="bg-background" />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@exemplo.com" className="bg-background" />
                                <InputError message={errors.email} />
                            </div>
                        </div>
                    </div>

                    {/* ── Endereço ── */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base mb-1">
                            <MapPin className="size-5 text-primary" />
                            Endereço
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input id="cep" value={data.cep} onChange={handleCepChange} placeholder="00000-000" maxLength={9} className="bg-background" />
                                <InputError message={errors.cep} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="street">Logradouro</Label>
                                <Input id="street" value={data.street} onChange={e => setData('street', e.target.value)} placeholder="Rua, Avenida..." className="bg-background" />
                                <InputError message={errors.street} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input id="number" value={data.number} onChange={e => setData('number', e.target.value)} placeholder="123" className="bg-background" />
                                <InputError message={errors.number} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input id="complement" value={data.complement} onChange={e => setData('complement', e.target.value)} placeholder="Apto, Bloco..." className="bg-background" />
                                <InputError message={errors.complement} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input id="neighborhood" value={data.neighborhood} onChange={e => setData('neighborhood', e.target.value)} placeholder="Centro" className="bg-background" />
                                <InputError message={errors.neighborhood} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} placeholder="São Paulo" className="bg-background" />
                                <InputError message={errors.city} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">UF</Label>
                                <Input id="state" maxLength={2} value={data.state} onChange={e => setData('state', e.target.value.toUpperCase())} placeholder="SP" className="bg-background" />
                                <InputError message={errors.state} />
                            </div>
                        </div>
                    </div>

                    {/* ── Emergência & Saúde ── */}
                    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 text-foreground font-bold text-base mb-1">
                            <Heart className="size-5 text-red-500" />
                            Contato de Emergência & Saúde
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="emergency_contact_name">Nome do contato de emergência</Label>
                                <Input id="emergency_contact_name" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} placeholder="Nome completo" className="bg-background" />
                                <InputError message={errors.emergency_contact_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="emergency_contact_phone">Telefone de emergência</Label>
                                <Input id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={e => setData('emergency_contact_phone', maskPhone(e.target.value))} placeholder="(11) 99999-9999" maxLength={15} className="bg-background" />
                                <InputError message={errors.emergency_contact_phone} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="health_notes">Observações Clínicas / Restrições de Saúde</Label>
                            <textarea
                                id="health_notes"
                                value={data.health_notes}
                                onChange={e => setData('health_notes', e.target.value)}
                                rows={3}
                                placeholder="Ex: Hérnia de disco L4-L5, hipertensão controlada..."
                                className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                            <InputError message={errors.health_notes} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-2">
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
