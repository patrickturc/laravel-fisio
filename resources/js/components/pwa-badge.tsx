import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { WifiOff, Download } from 'lucide-react';
import { Button } from './ui/button';

export default function PwaBadge() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline && !needRefresh) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {isOffline && (
                <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2">
                    <WifiOff className="size-4" />
                    Você está offline
                </div>
            )}
            
            {needRefresh && (
                <div className="flex flex-col gap-2 bg-background border px-4 py-3 rounded-lg shadow-xl text-sm animate-in slide-in-from-bottom-2">
                    <div className="font-medium">Nova atualização disponível!</div>
                    <div className="text-muted-foreground mb-1">Recarregue para ver as novidades.</div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateServiceWorker(true)}>
                            Atualizar Agora
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setNeedRefresh(false)}>
                            Depois
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
