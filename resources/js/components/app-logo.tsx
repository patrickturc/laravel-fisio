import { Activity } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary-foreground text-sidebar-primary-foreground shadow-sm">
                <Activity className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-foreground">
                    Phisio
                </span>
            </div>
        </>
    );
}
