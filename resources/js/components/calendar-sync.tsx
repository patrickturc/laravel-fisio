import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Copy, RefreshCw, Unplug } from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarSync() {
    const { auth } = usePage().props as any;
    const [generating, setGenerating] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const hasToken = !!auth.user.calendar_token;
    
    // Construct the absolute feed URL
    const feedUrl = hasToken 
        ? `${window.location.origin}/feed/calendar/${auth.user.calendar_token}.ics`
        : '';
        
    const webcalUrl = hasToken
        ? feedUrl.replace(/^https?:\/\//i, 'webcal://')
        : '';

    const handleGenerate = () => {
        setGenerating(true);
        router.post(route('profile.calendar-token.generate'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Link gerado com sucesso!');
            },
            onFinish: () => setGenerating(false)
        });
    };

    const handleRevoke = () => {
        if (!confirm('Tem certeza? Isso fará com que o link antigo pare de funcionar nas suas agendas.')) return;
        
        setRevoking(true);
        router.delete(route('profile.calendar-token.revoke'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sincronização desativada.');
            },
            onFinish: () => setRevoking(false)
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(feedUrl);
        toast.success('Link copiado para a área de transferência!');
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Sincronização de Agenda"
                description="Conecte a agenda do Phisio ao seu Outlook, Google Calendar ou Apple Calendar."
            />

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-4">
                    {!hasToken ? (
                        <div className="text-center space-y-4">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Sincronize seus agendamentos</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Gere um link secreto para visualizar suas consultas diretamente no seu app de calendário preferido.
                                </p>
                            </div>
                            <Button onClick={handleGenerate} disabled={generating}>
                                {generating && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                                Gerar Link de Sincronização
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Seu Link Secreto (Feed iCal)</Label>
                                <div className="flex gap-2">
                                    <Input readOnly value={feedUrl} className="font-mono text-sm bg-muted" />
                                    <Button variant="secondary" onClick={copyToClipboard}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copiar
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Copie este link e adicione como uma nova agenda "Por URL" no seu Outlook ou Google Calendar.
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-3 border-t">
                                <Button asChild variant="outline" className="gap-2">
                                    <a href={webcalUrl}>
                                        <CalendarDays className="w-4 h-4" />
                                        Abrir no App de Calendário
                                    </a>
                                </Button>

                                <Button 
                                    variant="ghost" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleRevoke}
                                    disabled={revoking}
                                >
                                    {revoking ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Unplug className="w-4 h-4 mr-2" />
                                    )}
                                    Desativar Sincronização
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
