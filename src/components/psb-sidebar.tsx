"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, Activity, Menu, ArrowLeft, School } from "lucide-react";
import { useState } from "react";

const menuItems = [
    {
        title: "Informasi Pesantren",
        href: "/psb",
        icon: LayoutDashboard,
    },
    {
        title: "Profil Asatidz",
        href: "/psb/profil",
        icon: Users,
    },
    {
        title: "Alur Pendaftaran",
        href: "/psb/alur",
        icon: Activity,
    },
    {
        title: "Pendaftaran Online",
        href: "/psb/daftar",
        icon: FileText,
    },
];

export function PSBSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-emerald-950/90 dark:bg-emerald-950/90 text-white relative overflow-hidden backdrop-blur-md supports-[backdrop-filter]:bg-emerald-950/60">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-transparent to-teal-900/80 z-0 pointer-events-none" />

            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none z-0">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 -left-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
            </div>

            <div className="p-6 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                        <span className="text-xl font-bold">Q</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-wide">QUBA</h1>
                        <p className="text-xs text-emerald-200/80">PP Muhammadiyah Bangsri</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 relative z-10 overflow-y-auto">
                <ul className="space-y-1.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-white/15 to-white/5 text-white shadow-sm ring-1 ring-white/20"
                                            : "text-emerald-100/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-emerald-300")} />
                                    <span>{item.title}</span>
                                    {isActive && (
                                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-white/10 relative z-10">
                <div className="mb-4 p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden group">
                    {/* Decorative circle */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl group-hover:bg-emerald-400/30 transition-all"></div>

                    <div className="relative">
                        <p className="text-xs font-medium text-emerald-200 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Butuh Bantuan?
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                                <Users className="w-5 h-5 text-emerald-100" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white leading-tight">Ustadzah Fitri</p>
                                <p className="text-xs text-emerald-100 opacity-80 mt-0.5">0898-1006-099</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Link href="/login">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-emerald-100/80 hover:text-white hover:bg-white/10 gap-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Login
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 text-emerald-800 dark:text-emerald-200 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-emerald-200 dark:border-emerald-800 shadow-sm hover:bg-emerald-50">
                        <Menu className="w-5 h-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-r-0 rounded-r-2xl overflow-hidden bg-transparent shadow-2xl">
                    <SheetTitle className="sr-only">Menu Navigasi PSB</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 h-screen fixed top-0 left-0 bottom-0 z-40 bg-transparent border-r border-white/5 shadow-2xl">
                <SidebarContent />
            </div>
        </>
    );
}
