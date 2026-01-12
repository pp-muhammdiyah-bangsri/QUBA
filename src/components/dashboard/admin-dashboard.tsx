"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, BookOpen, Calendar } from "lucide-react";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { RecentActivities, ActivityItem } from "@/components/recent-activities";
import { UpcomingEvents, EventItem } from "@/components/upcoming-events";

interface AdminDashboardProps {
    stats: {
        santriCount: number;
        santriPutraCount: number;
        santriPutriCount: number;
        asatidzCount: number;
        hafalanCount: number;
        eventCount: number;
    };
    chartData: {
        jenjangData: { name: string; value: number }[];
        hafalanPerBulan: { bulan: string; selesai: number }[];
        pelanggaranTrend: { bulan: string; jumlah: number }[];
    };
    recentActivities: ActivityItem[];
    upcomingEvents: EventItem[];
}

export function AdminDashboard({ stats, chartData, recentActivities, upcomingEvents }: AdminDashboardProps) {
    const statCards = [
        {
            title: "Jumlah Santri",
            value: stats.santriCount,
            subtitle: `Putra: ${stats.santriPutraCount} | Putri: ${stats.santriPutriCount}`,
            icon: Users,
            variant: "blue",
        },
        {
            title: "Jumlah Asatidz",
            value: stats.asatidzCount,
            icon: UserCog,
            variant: "emerald",
        },
        {
            title: "Hafalan Selesai",
            value: stats.hafalanCount,
            icon: BookOpen,
            variant: "purple",
        },
        {
            title: "Event Mendatang",
            value: stats.eventCount,
            icon: Calendar,
            variant: "orange",
        },
    ];

    const getVariantClasses = (variant: string) => {
        switch (variant) {
            case "blue":
                return {
                    bg: "bg-blue-50 dark:bg-blue-500/10",
                    hoverBg: "group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/20",
                    iconContainer: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
                    blob: "bg-blue-500",
                    icon: "text-blue-600 dark:text-blue-400"
                };
            case "emerald":
                return {
                    bg: "bg-emerald-50 dark:bg-emerald-500/10",
                    hoverBg: "group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-500/20",
                    iconContainer: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
                    blob: "bg-emerald-500",
                    icon: "text-emerald-600 dark:text-emerald-400"
                };
            case "purple":
                return {
                    bg: "bg-purple-50 dark:bg-purple-500/10",
                    hoverBg: "group-hover:bg-purple-50/50 dark:group-hover:bg-purple-500/20",
                    iconContainer: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
                    blob: "bg-purple-500",
                    icon: "text-purple-600 dark:text-purple-400"
                };
            case "orange":
                return {
                    bg: "bg-orange-50 dark:bg-orange-500/10",
                    hoverBg: "group-hover:bg-orange-50/50 dark:group-hover:bg-orange-500/20",
                    iconContainer: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
                    blob: "bg-orange-500",
                    icon: "text-orange-600 dark:text-orange-400"
                };
            default:
                return {
                    bg: "bg-gray-50 dark:bg-gray-800",
                    hoverBg: "group-hover:bg-gray-100 dark:group-hover:bg-gray-700",
                    iconContainer: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    blob: "bg-gray-500",
                    icon: "text-gray-600 dark:text-gray-400"
                };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">Selamat datang kembali di Control Panel QUBA</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 transition-colors">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    System Online
                </div>
            </div>

            {/* Stats Cards - Modern Gradient Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const styles = getVariantClasses(stat.variant);
                    return (
                        <Card
                            key={stat.title}
                            className={`group border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${styles.bg} ${styles.hoverBg}`}
                        >
                            {/* Decorative Background Blob */}
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${styles.blob} opacity-[0.08] blur-xl group-hover:scale-150 transition-transform duration-500`}></div>

                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-2 tracking-tight">
                                            {stat.value.toLocaleString('id-ID')}
                                        </h3>
                                        {stat.subtitle && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-muted-foreground border border-black/5 dark:border-white/5">
                                                    {stat.subtitle}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3.5 rounded-xl shadow-sm ring-1 ring-black/5 ${styles.iconContainer}`}>
                                        <Icon className={`w-6 h-6`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section - Clean Layout */}
            <div>
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full shadow-sm"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analitik & Statistik</h3>
                </div>
                <DashboardCharts
                    jenjangData={chartData.jenjangData}
                    hafalanPerBulan={chartData.hafalanPerBulan}
                    pelanggaranTrend={chartData.pelanggaranTrend}
                />
            </div>

            {/* Activities & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Aktivitas Terbaru</h3>
                        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                            Lihat Semua
                        </button>
                    </div>
                    <RecentActivities activities={recentActivities} />
                </div>

                {/* Upcoming Events */}
                <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Event Mendatang</h3>
                        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors">
                            Lihat Semua
                        </button>
                    </div>
                    <UpcomingEvents events={upcomingEvents} />
                </div>
            </div>
        </div>
    );
}
