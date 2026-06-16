import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Users, Plus, Search, Calendar, MoreVertical, Edit, Trash, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { GroupClassFormSheet } from './group-class-form-sheet';

export default function GroupClassesIndex({ groupClasses, patients = [], users = [] }: { groupClasses: any[], patients?: any[], users?: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Turmas', href: '/group-classes' },
    ];

    const [search, setSearch] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const filteredClasses = groupClasses.filter(gc => 
        gc.name.toLowerCase().includes(search.toLowerCase())
    );

    const formatDays = (schedules: any[]) => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        if (!schedules || schedules.length === 0) return 'Sem horário definido';
        
        return schedules.map(s => `${days[s.day_of_week]} ${s.start_time.substring(0, 5)}`).join(', ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Turmas" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar turmas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                    <Button onClick={() => setIsSheetOpen(true)} className="w-full sm:w-auto rounded-xl gap-2 shadow-sm font-medium">
                        <Plus className="size-4" /> Nova Turma
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((groupClass, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={groupClass.id}
                        >
                            <Link href={`/group-classes/${groupClass.id}`} className="block h-full">
                                <div className="bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group h-full flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: groupClass.color || '#8b5cf6' }} />
                                    
                                    <div className="flex items-start justify-between mb-4 mt-1">
                                        <div className="size-12 rounded-xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: groupClass.color || '#8b5cf6' }}>
                                            <Users className="size-6" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                            groupClass.status === 'active' 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {groupClass.status === 'active' ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">{groupClass.name}</h3>
                                    
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Calendar className="size-4" />
                                        <span>{formatDays(groupClass.schedules)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs mb-4">
                                        <CalendarClock className="size-3.5 text-muted-foreground" />
                                        {groupClass.appointments_max_appointment_date ? (
                                            <span className="text-muted-foreground">
                                                Aulas geradas até <span className="font-semibold text-foreground">{new Date(groupClass.appointments_max_appointment_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                            </span>
                                        ) : (
                                            <span className="text-amber-600 font-medium">Nenhuma aula gerada</span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {groupClass.patients?.slice(0, 3).map((p: any, i: number) => (
                                                    <div key={p.id} className={`size-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold shadow-sm ${
                                                        ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700'][i%3]
                                                    }`}>
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                                {groupClass.patients?.length === 0 && (
                                                    <span className="text-xs text-muted-foreground ml-2">Sem alunos</span>
                                                )}
                                                {groupClass.patients?.length > 3 && (
                                                    <div className="size-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        +{groupClass.patients.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                                            {groupClass.patients?.length || 0} / {groupClass.max_participants} vagas
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {filteredClasses.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <div className="size-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                                <Users className="size-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Nenhuma turma encontrada</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Comece criando sua primeira turma para organizar seus alunos em grupos e gerenciar as sessões de forma automática.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <GroupClassFormSheet 
                isOpen={isSheetOpen}
                setIsOpen={setIsSheetOpen}
                patients={patients}
                users={users}
            />
        </AppLayout>
    );
}
