import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { UserPlus, Search, Edit, FileText, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/pagination';
import { PatientFormSheet, type Patient } from './PatientFormSheet';
import { usePermissions } from '@/hooks/use-permissions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pacientes', href: '/patients' },
];

interface PaginatedPatients {
    data: any[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function PatientsIndex({ patients, filters = {} }: { patients: PaginatedPatients; filters?: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const { can } = usePermissions();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('create') === 'true') {
            setIsSheetOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete('create');
            window.history.replaceState({}, '', url);
        }
    }, []);

    function applyFilters() {
        router.get('/patients', {
            ...(search ? { search } : {}),
            ...(typeFilter ? { type: typeFilter } : {}),
        }, { preserveState: true, replace: true });
    }

    function handleSearchKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') applyFilters();
    }

    function clearFilters() {
        setSearch('');
        setTypeFilter('');
        router.get('/patients', {}, { preserveState: true, replace: true });
    }

    const hasFilters = filters.search || filters.type;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes - Phisio" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">Pacientes</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os cadastros e informações dos seus pacientes.</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={e => { setTypeFilter(e.target.value); setTimeout(() => router.get('/patients', { ...(search ? { search } : {}), ...(e.target.value ? { type: e.target.value } : {}) }, { preserveState: true, replace: true }), 0); }}
                            className="h-10 px-3 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                        >
                            <option value="">Todos</option>
                            <option value="pilates">Pilates</option>
                            <option value="physiotherapy">Fisioterapia</option>
                        </select>
                        {hasFilters && (
                            <button onClick={clearFilters} className="h-10 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors border border-border">
                                Limpar
                            </button>
                        )}
                        {can('patients.manage.create') && (
                            <button
                                onClick={() => {
                                    setEditingPatient(null);
                                    setIsSheetOpen(true);
                                }}
                                className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <UserPlus className="size-4" />
                                <span className="hidden sm:inline">Novo Paciente</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table/List section with Glassmorphism */}
                <div className="bg-card/60 backdrop-blur-xl border border-border/50 overflow-hidden rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/30 text-muted-foreground text-xs uppercase font-medium border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4 hidden md:table-cell">CPF</th>
                                    <th className="px-6 py-4 hidden sm:table-cell">Telefone</th>
                                    <th className="px-6 py-4 text-center">Categoria</th>
                                    <th className="px-6 py-4 text-center hidden lg:table-cell">Plano</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.data.length > 0 ? (
                                    patients.data.map((patient: any, index: number) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            key={patient.id}
                                            onClick={() => router.visit(`/patients/${patient.id}`)}
                                            className="border-b border-border/30 hover:bg-muted/30 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                                        {(patient.nickname || patient.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/patients/${patient.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-foreground hover:text-primary transition-colors block truncate">
                                                            {patient.name}
                                                        </Link>
                                                        {patient.nickname && (
                                                            <p className="text-xs text-muted-foreground truncate">"{patient.nickname}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">{patient.cpf || '-'}</td>
                                            <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">{patient.phone || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                    patient.type === 'pilates' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                }`}>
                                                    {patient.type === 'pilates' ? 'Pilates' : 'Fisioterapia'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center hidden lg:table-cell">
                                                {patient.active_membership ? (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        ✓ {patient.active_membership.plan_name}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                                        Sem Plano
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/patients/${patient.id}`} className="p-2.5 text-muted-foreground hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-500/10" title="Ver Paciente e Evoluções">
                                                        <FileText className="size-4" />
                                                    </Link>
                                                    {can('patients.manage.edit') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingPatient(patient);
                                                                setIsSheetOpen(true);
                                                            }}
                                                            className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                                                            title="Editar Paciente"
                                                        >
                                                            <Edit className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                    <Search className="size-6 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-base font-medium text-foreground">Pacientes não encontrados</p>
                                                <p className="text-sm">Não há ninguém aqui com esse nome ou cpf.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {patients.total > 0 && (
                        <div className="border-t border-border/30 px-6">
                            <Pagination links={patients.links} from={patients.from} to={patients.to} total={patients.total} />
                        </div>
                    )}
                </div>

            </div>
            
            <PatientFormSheet 
                key={editingPatient ? editingPatient.id : 'new'} 
                open={isSheetOpen} 
                onOpenChange={setIsSheetOpen} 
                patient={editingPatient} 
            />
        </AppLayout>
    );
}
