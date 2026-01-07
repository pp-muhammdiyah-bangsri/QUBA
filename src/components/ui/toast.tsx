"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: "bg-emerald-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
};

const bgMap = {
    success: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    warning: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
};

const textMap = {
    success: "text-emerald-800 dark:text-emerald-200",
    error: "text-red-800 dark:text-red-200",
    warning: "text-amber-800 dark:text-amber-200",
    info: "text-blue-800 dark:text-blue-200",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const Icon = iconMap[toast.type];

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-xl border shadow-lg",
                "toast-animate",
                "w-full max-w-sm",
                bgMap[toast.type]
            )}
            role="alert"
        >
            <div className={cn("p-1 rounded-full shrink-0", colorMap[toast.type])}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-sm", textMap[toast.type])}>
                    {toast.title}
                </p>
                {toast.message && (
                    <p className={cn("text-sm mt-0.5 opacity-80", textMap[toast.type])}>
                        {toast.message}
                    </p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className={cn(
                    "shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors",
                    textMap[toast.type]
                )}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, type, title, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container - Fixed position, responsive */}
            <div
                className={cn(
                    "fixed z-[100] flex flex-col gap-2 p-4",
                    // Mobile: bottom center, full width
                    "bottom-0 left-0 right-0 items-center",
                    // Desktop: bottom right
                    "sm:bottom-4 sm:right-4 sm:left-auto sm:items-end"
                )}
                aria-live="polite"
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
