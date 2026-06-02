import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useConfirmModal } from '@/components/confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configurações', href: '/settings/users' },
    { title: 'Perfis de Acesso', href: '/settings/roles' },
];

export default function RolesIndex({ roles, groupedPermissions }: { roles: any[], groupedPermissions: any }) {
    const { confirm, modal } = useConfirmModal();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    function openCreate() {
        setEditingRole(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEdit(role: any) {
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions ? role.permissions.map((p: any) => p.name) : [],
        });
        clearErrors();
        setIsModalOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editingRole) {
            put(`/settings/roles/${editingRole.id}`, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post('/settings/roles', {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    }

    async function handleDelete(role: any) {
        const confirmed = await confirm({
            title: 'Excluir Perfil',
            message: `Tem certeza que deseja excluir o perfil "${role.name}"? Isso afetará os usuários vinculados.`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) {
            router.delete(`/settings/roles/${role.id}`);
        }
    }

    function togglePermission(permissionName: string) {
        if (data.permissions.includes(permissionName)) {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        } else {
            setData('permissions', [...data.permissions, permissionName]);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfis de Acesso - Configurações" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-6xl mx-auto w-full">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Perfis de Acesso</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os perfis e as permissões de cada módulo.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="size-4" />
                        <span>Novo Perfil</span>
                    </button>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                            <tr>
                                <th className="px-5 py-3.5 font-semibold">Nome do Perfil</th>
                                <th className="px-5 py-3.5 font-semibold">Permissões Habilitadas</th>
                                <th className="px-5 py-3.5 w-24 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {roles.map((role: any) => (
                                <tr key={role.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <ShieldCheck className="size-4" />
                                            </div>
                                            <span className="font-medium text-foreground">{role.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground">
                                        {role.name === 'Administrador' ? (
                                            <span className="text-emerald-600 font-medium">Acesso Total (All)</span>
                                        ) : (
                                            <span>{role.permissions?.length || 0} permissões</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {role.name !== 'Administrador' && (
                                                <>
                                                    <button onClick={() => openEdit(role)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(role)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-card w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        <div className="px-6 py-4 border-b border-border/50">
                            <h2 className="text-xl font-semibold">{editingRole ? 'Editar Perfil' : 'Novo Perfil'}</h2>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome do Perfil</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium border-b border-border/50 pb-2">Permissões de Acesso</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto p-1">
                                    {Object.entries(groupedPermissions).map(([module, perms]: [string, any]) => (
                                        <div key={module} className="bg-muted/30 border border-border/50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold capitalize mb-3 text-primary">{module.replace('_', ' ')}</h4>
                                            <div className="space-y-2">
                                                {perms.map((p: any) => (
                                                    <label key={p.name} className="flex items-center gap-2 cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="peer sr-only"
                                                                checked={data.permissions.includes(p.name)}
                                                                onChange={() => togglePermission(p.name)}
                                                            />
                                                            <div className="w-4 h-4 rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                                                                {data.permissions.includes(p.name) && (
                                                                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {p.name.split('.').slice(1).join(' ')}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-border/50 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {modal}
        </AppLayout>
    );
}
