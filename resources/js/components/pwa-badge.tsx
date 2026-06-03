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

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (!isOffline && !needRefresh && !deferredPrompt) {
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

            {deferredPrompt && !isOffline && !needRefresh && (
                <div className="flex flex-col gap-2 bg-primary/10 border border-primary/20 px-4 py-3 rounded-lg shadow-xl text-sm animate-in slide-in-from-bottom-2 backdrop-blur-md">
                    <div className="font-medium text-primary flex items-center gap-2">
                        <Download className="size-4" />
                        Instalar App
                    </div>
                    <div className="text-muted-foreground mb-1">Instale o Phisio no seu dispositivo para acesso rápido.</div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleInstallClick}>
                            Instalar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeferredPrompt(null)}>
                            Agora não
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
