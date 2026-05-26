import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Trash2, User, Tag, Calendar as CalendarIcon, DollarSign, Clock } from 'lucide-react';
import { useConfirmModal, ConfirmModal } from '@/components/confirm-modal';
import { motion } from 'framer-motion';

export default function MembershipShow({ membership }: { membership: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Matrículas', href: '/memberships' },
        { title: membership.plan_name, href: `/memberships/${membership.id}` },
    ];

    const confirm = useConfirmModal();

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active':
                return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Ativa</span>;
            case 'expired':
                return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Vencida</span>;
            case 'cancelled':
                return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Cancelada</span>;
            default:
                return null;
        }
    };

    const daysRemaining = () => {
        const end = new Date(membership.end_date);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const days = daysRemaining();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${membership.plan_name} - Phisio`} />
            <ConfirmModal {...confirm} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-4xl mx-auto w-full">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/memberships" className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                            <ArrowLeft className="size-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{membership.plan_name}</h1>
                            <p className="text-muted-foreground mt-1">Detalhes da matrícula</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/memberships/${membership.id}/edit`}
                            className="flex items-center gap-2 h-10 px-4 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors shadow-sm"
                        >
                            <Edit className="size-4" />
                            Editar
                        </Link>
                        <button
                            onClick={() => confirm.open({
                                title: 'Excluir Matrícula',
                                message: 'Tem certeza que deseja excluir esta matrícula? Esta ação não pode ser desfeita.',
                                onConfirm: () => router.delete(`/memberships/${membership.id}`),
                            })}
                            className="flex items-center gap-2 h-10 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                        >
                            <Trash2 className="size-4" />
                            Excluir
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <DollarSign className="size-5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Valor</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {parseFloat(membership.price).toFixed(2).replace('.', ',')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Clock className="size-5 text-blue-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Dias Restantes</span>
                        </div>
                        <p className={`text-2xl font-bold ${days > 7 ? 'text-foreground' : days > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                            {days > 0 ? `${days} dias` : days === 0 ? 'Vence hoje' : 'Vencida'}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Tag className="size-5 text-purple-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Status</span>
                        </div>
                        <div className="mt-1">{getStatusBadge(membership.status)}</div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-6 md:p-8"
                >
                    <h2 className="text-lg font-semibold text-foreground mb-6">Informações da Matrícula</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Aluno</label>
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1.5 rounded-md">
                                    <User className="size-4 text-primary" />
                                </div>
                                {membership.patient ? (
                                    <Link href={`/patients/${membership.patient.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                        {membership.patient.name}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-muted-foreground">—</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Plano</label>
                            <div className="flex items-center gap-2">
                                <Tag className="size-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{membership.plan_name}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Início</label>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">
                                    {new Date(membership.start_date).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Vencimento</label>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                <span className={`font-medium ${days <= 7 && days >= 0 ? 'text-amber-500' : days < 0 ? 'text-red-500' : 'text-foreground'}`}>
                                    {new Date(membership.end_date).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Valor</label>
                            <div className="flex items-center gap-2">
                                <DollarSign className="size-4 text-muted-foreground" />
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    R$ {parseFloat(membership.price).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Status</label>
                            <div>{getStatusBadge(membership.status)}</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
