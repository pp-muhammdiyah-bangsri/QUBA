"use client";

import { Menu, X } from "lucide-react";
import { useState, createContext, useContext } from "react";

interface MobileSidebarContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
    isOpen: false,
    toggle: () => { },
    close: () => { },
});

export const useMobileSidebar = () => useContext(MobileSidebarContext);

interface MobileSidebarProviderProps {
    children: React.ReactNode;
}

export function MobileSidebarProvider({ children }: MobileSidebarProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    return (
        <MobileSidebarContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </MobileSidebarContext.Provider>
    );
}

export function MobileHeader() {
    const { isOpen, toggle } = useMobileSidebar();

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-emerald-950 text-slate-900 dark:text-white px-4 py-3 flex items-center justify-between shadow-sm dark:shadow-lg border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 text-white dark:bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold">Q</span>
                </div>
                <div>
                    <h1 className="font-bold text-base">QUBA</h1>
                </div>
            </div>
            <button
                onClick={toggle}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
    );
}

export function MobileOverlay() {
    const { isOpen, close } = useMobileSidebar();

    if (!isOpen) return null;

    return (
        <div
            className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={close}
        />
    );
}
