import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Activity, Users, Calendar, FileText, Shield, Smartphone, Zap, ChevronRight, Heart } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props;

    const features = [
        {
            icon: Users,
            color: 'from-primary to-blue-500',
            bg: 'bg-primary/10',
            textColor: 'text-primary',
            title: 'Gestão de Pacientes',
            description: 'Cadastre pacientes com dados completos, tipo de atendimento, aniversários e histórico clínico integrado.',
        },
        {
            icon: Calendar,
            color: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-500/10',
            textColor: 'text-emerald-600',
            title: 'Agenda Inteligente',
            description: 'Agende sessões com visualização semanal interativa. Veja compromissos do dia, duração e status em tempo real.',
        },
        {
            icon: FileText,
            color: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-500/10',
            textColor: 'text-amber-600',
            title: 'Evoluções SOAP',
            description: 'Registre evoluções clínicas completas no formato SOAP — Subjetivo, Objetivo, Avaliação e Plano — com facilidade.',
        },
        {
            icon: Shield,
            color: 'from-violet-500 to-purple-500',
            bg: 'bg-violet-500/10',
            textColor: 'text-violet-600',
            title: 'Segurança de Dados',
            description: 'Seus dados armazenados com segurança na nuvem. Acesso protegido por autenticação com verificação em duas etapas.',
        },
        {
            icon: Smartphone,
            color: 'from-pink-500 to-rose-500',
            bg: 'bg-pink-500/10',
            textColor: 'text-pink-600',
            title: 'Acesso Mobile',
            description: 'Interface responsiva que funciona perfeitamente no celular, tablet ou computador. Acesse de onde estiver.',
        },
        {
            icon: Zap,
            color: 'from-cyan-500 to-sky-500',
            bg: 'bg-cyan-500/10',
            textColor: 'text-cyan-600',
            title: 'Dashboard Completo',
            description: 'Visão geral do seu dia: pacientes cadastrados, sessões agendadas, evoluções pendentes e aniversariantes da semana.',
        },
    ];

    const steps = [
        { step: '01', title: 'Crie sua conta', description: 'Cadastre-se gratuitamente em segundos e comece a usar imediatamente.' },
        { step: '02', title: 'Cadastre seus pacientes', description: 'Adicione seus pacientes com dados completos e tipo de atendimento.' },
        { step: '03', title: 'Agende as sessões', description: 'Organize sua agenda semanal com horários, durações e status automáticos.' },
        { step: '04', title: 'Registre evoluções', description: 'Documente cada atendimento com o formato SOAP profissional e completo.' },
    ];

    return (
        <>
            <Head title="Phisio - Pilares e Fisioterapia" />
            <div className="relative min-h-screen bg-neutral-50 flex flex-col overflow-hidden selection:bg-primary/30">

                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {/* Navbar */}
                <header className="relative z-20 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
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
                </header>

                {/* Hero Section */}
                <section className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto pt-16 md:pt-24 pb-32 md:pb-40">
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
                                Criar Conta Grátis
                            </Link>
                        )}
                    </div>

                    <div className="mt-16 sm:mt-24 w-full w-[90vw] sm:max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/20 bg-neutral-900/50 group">
                        {/* Play button overlay (decorative) */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="size-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Activity className="size-8 text-white ml-1" />
                            </div>
                        </div>
                        <div className="aspect-[16/9] w-full bg-neutral-900">
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover opacity-80"
                                poster="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2670&auto=format&fit=crop"
                            >
                                <source src="/videos/hero.mp4" type="video/mp4" />
                                Seu navegador não suporta vídeos HTML5.
                            </video>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative z-10 bg-white border-t border-neutral-200/60 py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">Funcionalidades</span>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 mb-4">
                                Tudo que você precisa,<br />em um só lugar.
                            </h2>
                            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                                Ferramentas pensadas para fisioterapeutas e instrutores de Pilates que desejam organizar e elevar seu atendimento clínico.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <div key={i} className="group bg-neutral-50/50 border border-neutral-200/60 rounded-2xl p-6 hover:shadow-lg hover:border-neutral-300/60 hover:-translate-y-1 transition-all duration-300">
                                    <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                                        <feature.icon className={`size-6 ${feature.textColor}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                                    <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="relative z-10 bg-neutral-50 py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4">Como funciona</span>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 mb-4">
                                Simples de usar,<br />poderoso de verdade.
                            </h2>
                            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
                                Comece a usar o Phisio em poucos minutos. Sem instalação, sem complicação.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((s, i) => (
                                <div key={i} className="relative text-center">
                                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 mb-5">
                                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">{s.step}</span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 left-[60%] w-[80%]">
                                            <div className="border-t-2 border-dashed border-neutral-200 w-full" />
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{s.title}</h3>
                                    <p className="text-neutral-500 text-sm leading-relaxed">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Highlight Section */}
                <section className="relative z-10 bg-white border-t border-neutral-200/60 py-20 md:py-28">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="bg-gradient-to-br from-primary to-emerald-500 rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Feito por fisioterapeutas,<br />para fisioterapeutas.
                                </h2>
                                <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                                    O Phisio foi criado com base na rotina real de profissionais de saúde. Sem funcionalidades desnecessárias, sem complexidade. Apenas o que você precisa para atender melhor.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href={register()} className="px-8 py-3.5 rounded-full bg-white text-primary font-semibold text-base hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5">
                                        Criar Conta Grátis <ChevronRight className="size-4 inline ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative z-10 bg-neutral-50 border-t border-neutral-200/60 py-16 md:py-20">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">100%</p>
                                <p className="text-neutral-500 text-sm mt-1">Online</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">SOAP</p>
                                <p className="text-neutral-500 text-sm mt-1">Formato Clínico</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">2FA</p>
                                <p className="text-neutral-500 text-sm mt-1">Autenticação Segura</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">24/7</p>
                                <p className="text-neutral-500 text-sm mt-1">Acesso Ilimitado</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 bg-neutral-900 text-neutral-400 py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 p-1.5 text-white flex items-center justify-center">
                                    <Activity className="size-full stroke-[2.5]" />
                                </div>
                                <span className="font-bold text-lg text-white">Phisio</span>
                            </div>
                            <p className="text-sm flex items-center gap-1">
                                Feito com <Heart className="size-3.5 text-red-400 fill-red-400" /> para profissionais de saúde
                            </p>
                            <p className="text-sm">© {new Date().getFullYear()} Phisio. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
