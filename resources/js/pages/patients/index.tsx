import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { UserPlus, Search, Edit, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pacientes', href: '/patients' },
];

export default function PatientsIndex({ patients = [] }: { patients: any[] }) {
    const [search, setSearch] = useState('');
    
    // In a real app we'd also paginate, but let's filter purely client side for the WOW demo
    const filteredPatients = patients.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.cpf?.includes(search)
    );

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
                    
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Buscar paciente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full h-10 pl-9 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                            />
                        </div>
                        <Link 
                            href="/patients/create" 
                            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <UserPlus className="size-4" />
                            <span className="hidden sm:inline">Novo Paciente</span>
                        </Link>
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
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            key={patient.id} 
                                            className="border-b border-border/30 hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary font-bold shadow-inner">
                                                    {patient.name ? patient.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                {patient.name}
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
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/patients/${patient.id}/evolutions`} className="p-2 text-muted-foreground hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-500/10" title="Ver Evoluções">
                                                        <FileText className="size-4" />
                                                    </Link>
                                                    <Link href={`/patients/${patient.id}/edit`} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10" title="Editar Paciente">
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
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
                </div>

            </div>
        </AppLayout>
    );
}
