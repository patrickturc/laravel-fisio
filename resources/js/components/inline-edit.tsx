import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
    value: string;
    label: string;
}

interface InlineEditProps {
    value: string;
    onSave: (val: string) => void;
    type?: 'text' | 'number' | 'select' | 'color';
    options?: Option[];
    className?: string;
    placeholder?: string;
    renderDisplay?: (value: string) => React.ReactNode;
}

export function InlineEdit({ 
    value, 
    onSave, 
    type = 'text', 
    options = [], 
    className = '', 
    placeholder = 'Clique para editar...',
    renderDisplay
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<any>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (tempValue !== value) {
            onSave(tempValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'select') {
            handleSave();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const displayValue = () => {
        if (renderDisplay) return renderDisplay(value);
        if (type === 'select') {
            const selected = options.find(o => o.value === value);
            return selected ? selected.label : placeholder;
        }
        return value || placeholder;
    };

    return (
        <div className="relative inline-flex items-center group">
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEditing(true)}
                        className={`cursor-pointer border border-transparent hover:border-border hover:bg-muted/50 px-2 py-1 -ml-2 rounded-lg transition-all flex items-center gap-2 ${className}`}
                        title="Clique para editar"
                    >
                        {type === 'color' && (
                            <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: value }} />
                        )}
                        <span className={!value ? 'text-muted-foreground italic' : ''}>
                            {displayValue()}
                        </span>
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1 -ml-2 z-10"
                    >
                        {type === 'select' ? (
                            <select
                                ref={inputRef}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={handleSave}
                                className="h-8 py-1 px-2 text-sm border-primary/50 focus:border-primary rounded-lg shadow-sm"
                            >
                                {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : type === 'color' ? (
                            <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl shadow-sm">
                                <input
                                    ref={inputRef}
                                    type="color"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                />
                                <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={handleCancel} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-sm">
                                <input
                                    ref={inputRef}
                                    type={type}
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`h-8 py-1 px-2 text-sm border-none focus:ring-0 bg-transparent min-w-[150px] ${className}`}
                                    placeholder={placeholder}
                                />
                                <div className="flex items-center border-l pl-1">
                                    <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleCancel} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
