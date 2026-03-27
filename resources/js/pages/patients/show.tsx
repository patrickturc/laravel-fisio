import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowLeft, Phone, MapPin, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Patient {
    id: string;
    name: string;
    phone: string | null;
    type: 'pilates' | 'physiotherapy';
    cpf: string | null;
    address: string | null;
    appointments: Array<{
        id: string;
        appointment_date: string;
        start_time: string;
        status: string;
    }>;
    evolutions: Array<{
        id: string;
        data_atendimento: string;
        tipo_atendimento: string;
    }>;
}

export default function PatientShow({ patient }: { patient: Patient }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pacientes', href: '/patients' },
        { title: patient.name, href: `/patients/${patient.id}` },
    ];

    function handleDelete() {
        if (confirm('Tem certeza que deseja excluir este paciente? Essa ação não pode ser desfeita.')) {
            router.delete(`/patients/${patient.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={patient.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/patients" className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
                            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${patient.type === 'pilates' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {patient.type === 'pilates' ? 'Pilates' : 'Fisioterapia'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/patients/${patient.id}/edit`} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Edit className="size-4" />
                        </Link>
                        <button onClick={handleDelete} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {patient.phone && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-semibold text-sm">{patient.phone}</p></div>
                        </div>
                    )}
                    {patient.cpf && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><FileText className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">CPF</p><p className="font-semibold text-sm">{patient.cpf}</p></div>
                        </div>
                    )}
                    {patient.address && (
                        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><MapPin className="size-4" /></div>
                            <div><p className="text-xs text-muted-foreground">Endereço</p><p className="font-semibold text-sm">{patient.address}</p></div>
                        </div>
                    )}
                </div>

                {/* Appointments */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="size-5 text-primary" /> Agendamentos</h2>
                        <Link href={`/appointments/create?patient_id=${patient.id}`} className="text-sm font-semibold text-primary hover:text-primary/80">+ Novo</Link>
                    </div>
                    {patient.appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Nenhum agendamento encontrado.</p>
                    ) : (
                        <div className="space-y-2">
                            {patient.appointments.slice(0, 5).map(app => (
                                <Link key={app.id} href={`/appointments/${app.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors border border-border/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{new Date(app.appointment_date).toLocaleDateString('pt-BR')}</span>
                                        <span className="text-sm text-muted-foreground">{app.start_time?.slice(0, 5)}</span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {app.status === 'completed' ? 'Realizado' : app.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Evolutions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="size-5 text-indigo-600" /> Evoluções</h2>
                        <Link href={`/evolutions/create?paciente_id=${patient.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">+ Nova</Link>
                    </div>
                    {patient.evolutions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma evolução registrada.</p>
                    ) : (
                        <div className="space-y-2">
                            {patient.evolutions.slice(0, 5).map(evo => (
                                <Link key={evo.id} href={`/evolutions/${evo.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors border border-border/20">
                                    <span className="text-sm font-medium">{new Date(evo.data_atendimento).toLocaleDateString('pt-BR')}</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{evo.tipo_atendimento}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
