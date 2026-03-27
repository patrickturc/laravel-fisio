import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Activity } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Phisio - Pilares e Fisioterapia" />
            <div className="relative min-h-screen bg-neutral-50 flex flex-col items-center justify-center overflow-hidden selection:bg-primary/30">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Navbar */}
                <div className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto z-10">
                    <div className="flex items-center gap-2">
                        <div className="size-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 p-2 text-white shadow-lg shadow-primary/20 flex items-center justify-center">
                            <Activity className="size-full stroke-[2.5]" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-neutral-900">Phisio</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href={dashboard()} className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">
                                Acessar Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="px-5 py-2 text-sm font-medium rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 transition-colors">
                                    Login
                                </Link>
                                {canRegister && (
                                    <Link href={register()} className="px-5 py-2 text-sm font-semibold rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm">
                                        Criar Conta
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>

                {/* Main Content */}
                <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Novo Sistema 2026
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-950 mb-6 drop-shadow-sm">
                        O seu estúdio,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                            totalmente digital.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl leading-relaxed">
                        Gerencie pacientes, histórico clínico, fotos e planilhas de exercícios de Fisioterapia e Pilates Clássico com a melhor experiência em usabilidade.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                        <Link href={login()} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
                            Começar Agora
                        </Link>
                        {canRegister && (
                            <Link href={register()} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-neutral-900 font-semibold text-base border border-neutral-200 hover:bg-neutral-50 transition-all shadow-sm">
                                Criar Conta
                            </Link>
                        )}
                    </div>
                </main>

                {/* Mockup Preview (Decorative) */}
                <div className="absolute bottom-0 translate-y-1/2 w-[800px] h-[400px] rounded-t-3xl bg-white shadow-[0_0_60px_-15px_rgba(0,0,0,0.1)] border border-neutral-200/50 flex justify-center pt-8 overflow-hidden z-0">
                    <div className="w-[90%] h-full rounded-t-xl bg-neutral-100 border border-neutral-200/80 p-2">
                        <div className="w-full h-full bg-white rounded-lg border border-neutral-200 shadow-sm flex flex-col gap-4 p-4">
                            {/* Fake UI */}
                            <div className="w-full h-8 flex items-center justify-between border-b pb-4">
                                <div className="w-32 h-4 bg-neutral-200 rounded-full" />
                                <div className="flex gap-2">
                                    <div className="size-6 bg-neutral-200 rounded-full" />
                                    <div className="size-6 bg-neutral-200 rounded-full" />
                                </div>
                            </div>
                            <div className="w-full flex-1 flex gap-4">
                                <div className="w-48 h-full bg-neutral-50 rounded-lg flex flex-col gap-2 p-2 hidden md:flex">
                                    <div className="w-full h-8 bg-neutral-200/50 rounded-md" />
                                    <div className="w-full h-8 bg-neutral-200/50 rounded-md" />
                                    <div className="w-full h-8 bg-neutral-200/50 rounded-md" />
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="w-full h-32 bg-primary/10 rounded-xl" />
                                    <div className="w-full flex-1 bg-neutral-50 border rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
