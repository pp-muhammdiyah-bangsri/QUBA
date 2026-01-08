"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Bell, X, BookOpen, AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotificationsForUser, dismissNotification } from "@/app/(dashboard)/notifications/actions";

interface Notification {
    id: string;
    type: "hafalan" | "pelanggaran" | "event" | "info";
    title: string;
    message: string;
    time: string;
    read: boolean;
    url?: string;
}

const iconMap = {
    hafalan: BookOpen,
    pelanggaran: AlertTriangle,
    event: Calendar,
    info: CheckCircle,
};

// Premium color palette for light/dark modes
const colorMap = {
    hafalan: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    pelanggaran: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900",
    event: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    info: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
};

// URL mapping based on notification type and title content (role-aware)
const getNotificationUrl = (type: string, title: string, userRole: string): string => {
    // Detect from title since type may always be "info"
    const titleLower = title.toLowerCase();

    // URLs that ortu CANNOT access
    const restrictedForOrtu = ["/kesantrian/event", "/kesantrian/pelanggaran", "/kesantrian/perizinan"];

    let url = "/"; // Default to dashboard

    if (titleLower.includes("hafalan") || titleLower.includes("tasmi")) {
        url = "/akademik/lembar";
    } else if (titleLower.includes("pelanggaran")) {
        url = "/kesantrian/pelanggaran";
    } else if (titleLower.includes("perizinan")) {
        url = "/kesantrian/perizinan";
    } else if (titleLower.includes("event")) {
        url = "/kesantrian/event";
    } else if (type === "hafalan") {
        url = "/akademik/lembar";
    } else if (type === "pelanggaran") {
        url = "/kesantrian/pelanggaran";
    } else if (type === "event") {
        url = "/kesantrian/event";
    }

    // If ortu and URL is restricted, redirect to dashboard
    if (userRole === "ortu" && restrictedForOrtu.includes(url)) {
        return "/";
    }

    return url;
};

// LocalStorage keys (for read status only now, dismissals are server-side)
const READ_KEY = "quba_read_notifications";

const getReadIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    } catch {
        return [];
    }
};

const saveReadId = (id: string) => {
    if (typeof window === "undefined") return;
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(READ_KEY, JSON.stringify(readIds));
    }
};

const saveAllAsRead = (ids: string[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
};

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userRole, setUserRole] = useState<string>("ortu");
    const [loading, setLoading] = useState(true);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position above the button, aligned to left
            setDropdownPosition({
                top: rect.top - 8, // 8px gap above button
                left: Math.max(16, rect.left - 280 + rect.width), // Align right edge with button, min 16px from left
            });
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                buttonRef.current && !buttonRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch notifications from database (already filtered by server)
    const fetchNotifications = async () => {
        try {
            const result = await getNotificationsForUser();
            const readIds = getReadIds();

            // Map notifications with read status and URLs
            const mapped = result.notifications.map((n: Notification) => ({
                ...n,
                read: readIds.includes(n.id),
                url: n.url || getNotificationUrl(n.type, n.title, result.userRole),
            }));

            setNotifications(mapped);
            setUserRole(result.userRole);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        saveReadId(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        saveAllAsRead([...getReadIds(), ...allIds]);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const removeNotification = async (id: string) => {
        // Optimistically remove from UI
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Persist to server
        await dismissNotification(id);
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        setIsOpen(false);
        if (notification.url) {
            router.push(notification.url);
        }
    };

    // Dropdown content rendered via Portal
    const dropdownContent = isOpen && typeof document !== "undefined" ? createPortal(
        <div
            ref={dropdownRef}
            className="fixed w-80 sm:w-96 bg-white dark:bg-zinc-900 text-popover-foreground rounded-2xl shadow-2xl border border-border z-[99999] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                transform: 'translateY(-100%)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">
                        Notifikasi
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {unreadCount}
                    </span>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Tandai sudah dibaca
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/50 py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8" />
                        </div>
                        <p className="font-medium text-sm">Tidak ada notifikasi baru</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => {
                            const Icon = iconMap[notification.type];
                            return (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                                        !notification.read ? "bg-emerald-50/60 dark:bg-emerald-950/20" : "bg-transparent"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {/* Unread Indicator Dot */}
                                    {!notification.read && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-emerald-500" />
                                    )}

                                    <div className={cn("p-2.5 rounded-xl shrink-0 h-fit border", colorMap[notification.type])}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm leading-none",
                                                !notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notification.id);
                                                }}
                                                className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-muted rounded-md"
                                                title="Hapus notifikasi"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 pt-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200 border border-transparent",
                    isOpen
                        ? "bg-white/10 text-white"
                        : "text-emerald-100 hover:bg-white/10 hover:text-white"
                )}
                aria-label="Notifications"
            >
                <Bell className={cn("w-5 h-5", isOpen && "fill-white/20")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm ring-2 ring-emerald-900 border border-transparent">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>
            {dropdownContent}
        </>
    );
}
