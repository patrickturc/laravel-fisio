import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Users, CalendarRange, Activity, BarChart3, ClipboardList, DollarSign, CreditCard, Settings, ShieldCheck, Tag, RefreshCw } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { useCurrentUrl } from '@/hooks/use-current-url';

export function AppSidebar() {
    const { can } = usePermissions();
    const { isCurrentUrl } = useCurrentUrl();

    // Dynamically build main navigation based on permissions
    const mainNavItems = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, show: can('dashboard.view') },
        { title: 'Pacientes', href: '/patients', icon: Users, show: can('patients.manage.view') },
        { title: 'Turmas', href: '/group-classes', icon: Users, show: can('patients.manage.view') },
        { title: 'Agenda', href: '/appointments', icon: CalendarRange, show: can('appointments.manage.view') },
        { title: 'Evoluções', href: '/evolutions', icon: Activity, show: can('evolutions.manage.view') },
        { title: 'Relatórios', href: '/reports', icon: BarChart3, show: can('reports.manage.view') },
        { title: 'Matrículas', href: '/memberships', icon: CreditCard, show: can('memberships.manage.view') },
        {
            title: 'Financeiro',
            href: '/financial',
            icon: DollarSign,
            show: can('financial.transactions.view'),
            items: [
                { title: 'Fluxo de Caixa', href: '/financial', show: can('financial.transactions.view') },
                { title: 'Gastos Recorrentes', href: '/recurring-expenses', show: can('financial.transactions.view') },
            ].filter(item => item.show)
        },
    ].filter(item => item.show);

    const settingsNavItems = [
        { title: 'Protocolos Clínicos', href: '/clinical-protocols', icon: ClipboardList, show: can('treatment_plans.manage.view') },
        { title: 'Planos e Pacotes', href: '/commercial-plans', icon: Tag, show: can('memberships.manage.view') },
        { title: 'Usuários', href: '/settings/users', icon: Users, show: can('settings.users.view') },
        { title: 'Perfis de Acesso', href: '/settings/roles', icon: ShieldCheck, show: can('settings.roles.view') },
    ].filter(item => item.show);

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border/50 shadow-sm bg-sidebar/90 backdrop-blur-xl">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-primary/5 transition-colors">
                            <Link href={'/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {settingsNavItems.length > 0 && (
                    <SidebarGroup className="px-2 py-0 mt-4">
                        <SidebarGroupLabel>Configurações</SidebarGroupLabel>
                        <SidebarMenu>
                            {settingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
