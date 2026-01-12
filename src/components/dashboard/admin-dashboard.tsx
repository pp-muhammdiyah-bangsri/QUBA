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
            color: "bg-blue-500",
        },
        {
            title: "Jumlah Asatidz",
            value: stats.asatidzCount,
            icon: UserCog,
            color: "bg-emerald-500",
        },
        {
            title: "Hafalan Selesai",
            value: stats.hafalanCount,
            icon: BookOpen,
            color: "bg-purple-500",
        },
        {
            title: "Event Mendatang",
            value: stats.eventCount,
            icon: Calendar,
            color: "bg-orange-500",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">Selamat datang kembali di Control Panel QUBA</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-card px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-border">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Online
                </div>
            </div>

            {/* Stats Cards - Modern Gradient Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={`group border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative`}
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 dark:opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                            <CardContent className="p-6 relative">
                                <div className="flex flex-col gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                        <div className={`${stat.color} absolute inset-0 opacity-20 dark:opacity-40 rounded-xl`}></div>
                                        <Icon className={`w-6 h-6 relative z-10 text-white`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <h3 className="text-3xl font-bold text-foreground mt-1 tracking-tight">
                                            {stat.value.toLocaleString('id-ID')}
                                        </h3>
                                        {stat.subtitle && (
                                            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-border hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    Analitik & Statistik
                </h3>
                <DashboardCharts
                    jenjangData={chartData.jenjangData}
                    hafalanPerBulan={chartData.hafalanPerBulan}
                    pelanggaranTrend={chartData.pelanggaranTrend}
                />
            </div>

            {/* Activities & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-border bg-gray-50/50 dark:bg-muted/30">
                        <h3 className="font-semibold text-foreground">Aktivitas Terbaru</h3>
                    </div>
                    <div className="p-6">
                        <RecentActivities activities={recentActivities} />
                    </div>
                </div>
                <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-border bg-gray-50/50 dark:bg-muted/30">
                        <h3 className="font-semibold text-foreground">Event Mendatang</h3>
                    </div>
                    <div className="p-6">
                        <UpcomingEvents events={upcomingEvents} />
                    </div>
                </div>
            </div>
        </div>
    );
}
