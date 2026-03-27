import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export function Pagination({ links, from, to, total }: PaginationProps) {
    if (total <= 0) return null;

    // Filter out prev/next from numbered links
    const numbered = links.slice(1, -1);
    const prev = links[0];
    const next = links[links.length - 1];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-4">
            <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{from}</span> a{' '}
                <span className="font-semibold text-foreground">{to}</span> de{' '}
                <span className="font-semibold text-foreground">{total}</span> resultados
            </p>

            <div className="flex items-center gap-1">
                {prev.url ? (
                    <Link
                        href={prev.url}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                    </Link>
                ) : (
                    <span className="p-2 rounded-lg text-muted-foreground/30">
                        <ChevronLeft className="size-4" />
                    </span>
                )}

                {numbered.map((link, i) => (
                    <span key={i}>
                        {link.url ? (
                            <Link
                                href={link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                className="px-3 py-1.5 text-sm text-muted-foreground/50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </span>
                ))}

                {next.url ? (
                    <Link
                        href={next.url}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <ChevronRight className="size-4" />
                    </Link>
                ) : (
                    <span className="p-2 rounded-lg text-muted-foreground/30">
                        <ChevronRight className="size-4" />
                    </span>
                )}
            </div>
        </div>
    );
}
