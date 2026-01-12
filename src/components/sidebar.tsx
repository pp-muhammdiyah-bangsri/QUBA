"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    UserCog,
    BookOpen,
    Calendar,
    ClipboardList,
    FileText,
    Award,
    AlertTriangle,
    Clock,
    LogOut,
    ChevronDown,
    X,
    Layers,
    KeyRound,
    Bell,
    Settings,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Role } from "@/types/database.types";
import { useMobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notifications";
import { NotificationToggle } from "@/components/notification-toggle";

interface SidebarProps {
    userRole: Role;
    userName: string;
}

const menuItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        roles: ["admin", "ustadz", "ortu"],
    },
    {
        title: "Data Santri",
        href: "/santri",
        icon: Users,
        roles: ["admin"],
    },
    {
        title: "Data Asatidz",
        href: "/asatidz",
        icon: UserCog,
        roles: ["admin"],
    },
    {
        title: "Data Master",
        icon: Layers,
        roles: ["admin"],
        children: [
            { title: "Kelas", href: "/data-master/kelas", roles: ["admin"] },
            { title: "Halaqoh", href: "/data-master/halaqoh", roles: ["admin"] },
            { title: "Jadwal Rutin", href: "/data-master/jadwal-rutin", roles: ["admin"] },
            { title: "Bulk Assign", href: "/data-master/bulk-assign", roles: ["admin"] },
            { title: "Pendaftar PSB", href: "/data-master/pendaftar-psb", roles: ["admin"] },
        ],
    },
    {
        title: "Akademik",
        icon: BookOpen,
        roles: ["admin", "ustadz", "ortu"],
        children: [
            { title: "Hafalan Selesai", href: "/akademik/selesai", roles: ["admin", "ustadz", "ortu"] },
            { title: "Hafalan Per Lembar", href: "/akademik/lembar", roles: ["admin", "ustadz", "ortu"] },
            { title: "Tasmi'", href: "/akademik/tasmi", roles: ["admin", "ustadz", "ortu"] },
            { title: "Progres Hafalan", href: "/akademik/progres", roles: ["admin", "ustadz", "ortu"] },
        ],
    },
    {
        title: "Presensi",
        href: "/presensi",
        icon: ClipboardList,
        roles: ["admin", "ustadz"],
    },
    {
        title: "Event & Kalender",
        href: "/event",
        icon: Calendar,
        roles: ["admin", "ustadz"],
    },
    {
        title: "Kesantrian",
        icon: Award,
        roles: ["admin", "ustadz"], // Removed ortu
        children: [
            { title: "Pelanggaran", href: "/kesantrian/pelanggaran", icon: AlertTriangle, roles: ["admin", "ustadz"] },
            { title: "Perizinan", href: "/kesantrian/perizinan", icon: Clock, roles: ["admin", "ustadz"] },
        ],
    },
    {
        title: "Perizinan",
        href: "/kesantrian/perizinan",
        icon: Clock,
        roles: ["ortu"], // Standalone for ortu
    },
    {
        title: "Laporan",
        icon: FileText,
        roles: ["admin", "ustadz"], // Removed ortu
        children: [
            { title: "Laporan Bulanan", href: "/laporan", roles: ["admin", "ustadz"] },
            { title: "Rekap Presensi", href: "/laporan/rekap-presensi", roles: ["admin", "ustadz"] },
            { title: "Kinerja Ustadz", href: "/laporan/kinerja-ustadz", roles: ["admin"] },
        ],
    },

    {
        title: "Profil Asatidz",
        href: "/profil/pengajar",
        icon: UserCog,
        roles: ["ortu"],
    },
    {
        title: "Notifikasi",
        href: "/notifications",
        icon: Bell,
        roles: ["admin"],
    },
    {
        title: "Pengaturan",
        href: "/settings",
        icon: Settings,
        roles: ["admin", "ustadz", "ortu"],
    },
];

export function Sidebar({ userRole, userName }: SidebarProps) {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<string[]>(["Akademik", "Kesantrian", "Data Master"]);
    const supabase = createClient();
    const { isOpen: isSidebarOpen, close } = useMobileSidebar();

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out:", error);
            }
        } catch (err) {
            console.error("Logout error:", err);
        }
        // Force a full page reload to clear any cached state
        window.location.replace("/login");
    };

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(userRole)
    );

    const handleLinkClick = () => {
        // Close sidebar on mobile when clicking a link
        close();
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-64 bg-white dark:bg-emerald-950/90 text-slate-800 dark:text-white relative overflow-hidden backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-emerald-950/60",
            // Mobile: Fixed position, slide in/out
            "fixed md:relative z-40 transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-white/5 shadow-2xl",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            {/* Background Gradients - Only visible in Dark Mode */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-transparent to-teal-900/80 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300" />

            {/* Background Pattern - Only visible in Dark Mode */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-0 dark:opacity-20 pointer-events-none z-0 transition-opacity duration-300">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 -left-10 w-40 h-40 bg-teal-500 rounded-full blur-3xl"></div>
            </div>

            {/* Logo - with close button on mobile */}
            <div className="p-6 border-b border-slate-100 dark:border-white/10 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 text-white dark:bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-transparent dark:border-white/10 shadow-sm dark:shadow-none">
                            <span className="text-xl font-bold">Q</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-wide text-emerald-950 dark:text-white">QUBA</h1>
                            <p className="text-xs text-slate-500 dark:text-emerald-200/80">PP Muhammadiyah Bangsri</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-emerald-100" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto relative z-10">
                <ul className="space-y-1.5">
                    {filteredMenu.map((item) => {
                        const Icon = item.icon;
                        // For parent items, they are 'active' if any child is active, or if they have a direct href match (unlikely for parents)
                        // But usually we just check if it's open for the chevron, and maybe highlight if a child is active?
                        // For now let's keep the simple active check for direct links
                        const isActive = item.href ? pathname === item.href : false;
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus.includes(item.title);
                        const isChildActive = hasChildren && item.children!.some(child => pathname === child.href);

                        if (hasChildren) {
                            const filteredChildren = item.children!.filter((child) =>
                                child.roles.includes(userRole)
                            );

                            return (
                                <li key={item.title}>
                                    <button
                                        onClick={() => toggleMenu(item.title)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                            (isActive || isChildActive)
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-white/10 dark:text-white shadow-sm ring-1 ring-emerald-100 dark:ring-white/20"
                                                : "text-slate-600 dark:text-emerald-100/70 hover:bg-emerald-50 dark:hover:bg-white/10 hover:text-emerald-600 dark:hover:text-white hover:translate-x-1"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", (isActive || isChildActive) && "text-emerald-600 dark:text-emerald-300")} />
                                            <span>{item.title}</span>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "w-4 h-4 transition-transform text-slate-400 dark:text-white/50",
                                                isOpen && "rotate-180 text-emerald-600 dark:text-white"
                                            )}
                                        />
                                    </button>
                                    {isOpen && (
                                        <ul className="mt-2 ml-3 pl-3 border-l border-slate-200 dark:border-white/10 space-y-1">
                                            {filteredChildren.map((child) => {
                                                const isChildLinkActive = pathname === child.href;
                                                return (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            onClick={handleLinkClick}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative",
                                                                isChildLinkActive
                                                                    ? "text-emerald-600 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-white/5"
                                                                    : "text-slate-500 dark:text-emerald-100/60 hover:text-emerald-600 dark:hover:text-white hover:translate-x-1"
                                                            )}
                                                        >
                                                            {isChildLinkActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mr-1" />}
                                                            {child.title}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </li>
                            );
                        }

                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.href!}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-emerald-50 to-white dark:from-white/15 dark:to-white/5 text-emerald-700 dark:text-white shadow-sm ring-1 ring-emerald-100 dark:ring-white/20"
                                            : "text-slate-600 dark:text-emerald-100/70 hover:bg-emerald-50 dark:hover:bg-white/10 hover:text-emerald-600 dark:hover:text-white hover:translate-x-1"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-emerald-600 dark:text-emerald-300")} />
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

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 relative z-10">
                <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-base font-bold border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-100 shrink-0">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight break-words">
                                {(() => {
                                    const words = userName.split(" ");
                                    if (words.length > 3) {
                                        return words.slice(0, 3).join(" ") + " ...";
                                    }
                                    return userName;
                                })()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-emerald-200/60 capitalize mt-0.5">{userRole}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 pl-2">Preferensi</span>
                        <div className="flex items-center gap-1">
                            <NotificationToggle />
                            <NotificationBell />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    {userRole === "ustadz" && (
                        <Link
                            href="/profil/edit"
                            onClick={handleLinkClick}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-emerald-100/70 hover:bg-emerald-50 dark:hover:bg-white/10 hover:text-emerald-600 dark:hover:text-white transition-colors"
                        >
                            <UserCog className="w-4 h-4" />
                            <span>Edit Profil Saya</span>
                        </Link>
                    )}
                    {userRole === "ortu" && (
                        <Link
                            href="/profil/santri"
                            onClick={handleLinkClick}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-emerald-100/70 hover:bg-emerald-50 dark:hover:bg-white/10 hover:text-emerald-600 dark:hover:text-white transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span>Data Santri Saya</span>
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-emerald-100/70 hover:bg-red-50 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-200 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}