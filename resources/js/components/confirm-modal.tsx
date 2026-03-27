import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    open,
    title = 'Confirmar ação',
    message = 'Tem certeza? Esta ação não pode ser desfeita.',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md"
                    >
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${variant === 'danger' ? 'bg-red-100 dark:bg-red-500/10' : 'bg-amber-100 dark:bg-amber-500/10'}`}>
                                <AlertTriangle className={`size-6 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/30">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <Button
                                onClick={onConfirm}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm ${
                                    variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-amber-600 hover:bg-amber-700'
                                }`}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Hook for convenience
export function useConfirmModal() {
    const [state, setState] = useState<{
        open: boolean;
        resolve?: (value: boolean) => void;
        title?: string;
        message?: string;
        confirmLabel?: string;
    }>({ open: false });

    function confirm(options?: { title?: string; message?: string; confirmLabel?: string }): Promise<boolean> {
        return new Promise((resolve) => {
            setState({ open: true, resolve, ...options });
        });
    }

    function handleConfirm() {
        state.resolve?.(true);
        setState({ open: false });
    }

    function handleCancel() {
        state.resolve?.(false);
        setState({ open: false });
    }

    const modal = (
        <ConfirmModal
            open={state.open}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirm, modal };
}
