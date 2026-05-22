import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useConfirmModal } from '@/components/confirm-modal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configurações', href: '/settings/users' },
    { title: 'Usuários', href: '/settings/users' },
];

export default function UsersIndex({ users, roles }: { users: any, roles: any[] }) {
    const { confirm, modal } = useConfirmModal();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    function openCreate() {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    }

    function openEdit(user: any) {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0]?.name || '',
        });
        clearErrors();
        setIsModalOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editingUser) {
            put(`/settings/users/${editingUser.id}`, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post('/settings/users', {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    }

    async function handleDelete(user: any) {
        const confirmed = await confirm({
            title: 'Excluir Usuário',
            message: `Tem certeza que deseja excluir o usuário "${user.name}"?`,
            confirmLabel: 'Excluir',
        });
        if (confirmed) {
            router.delete(`/settings/users/${user.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários - Configurações" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 md:p-10 max-w-6xl mx-auto w-full">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuários</h1>
                        <p className="text-muted-foreground mt-1">Gerencie os usuários e seus perfis de acesso.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="size-4" />
                        <span>Novo Usuário</span>
                    </button>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                            <tr>
                                <th className="px-5 py-3.5 font-semibold">Nome</th>
                                <th className="px-5 py-3.5 font-semibold">Email</th>
                                <th className="px-5 py-3.5 font-semibold">Perfil (Role)</th>
                                <th className="px-5 py-3.5 w-24 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.data.map((user: any) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="size-4" />
                                            </div>
                                            <span className="font-medium text-foreground">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-muted-foreground">{user.email}</td>
                                    <td className="px-5 py-3.5">
                                        {user.roles && user.roles.length > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">
                                                <Shield className="size-3" />
                                                {user.roles[0].name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Sem Perfil</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(user)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                                                <Edit className="size-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border/50">
                            <h2 className="text-lg font-semibold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha {editingUser && <span className="text-muted-foreground text-xs font-normal">(Deixe em branco para manter)</span>}</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required={!editingUser}
                                />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Perfil de Acesso</label>
                                <select
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                >
                                    <option value="">Selecione um perfil...</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    Salvar
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
