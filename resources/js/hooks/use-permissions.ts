import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<any>().props;
    const permissions = auth.user?.permissions || [];
    const roles = auth.user?.roles || [];

    const can = (permission: string) => {
        // Admins can do everything
        if (roles.includes('Administrador')) return true;
        return permissions.includes(permission);
    };

    const hasRole = (role: string) => {
        return roles.includes(role);
    };

    return { can, hasRole, roles, permissions };
}
