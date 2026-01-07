"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UstadzDashboardProps {
    stats: {
        santriCount: number;
        hafalanHariIni: number;
        tasmiPending: number;
        eventCount: number;
    };
    recentSantri: {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        lastHafalan?: string;
    }[];
    upcomingEvents: {
        id: string;
        nama: string;
        tanggal: string;
        jenis: string;
    }[];
}

export function UstadzDashboard({ stats, recentSantri, upcomingEvents }: UstadzDashboardProps) {
    const statCards = [
        {
            title: "Total Santri",
            value: stats.santriCount,
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Hafalan Hari Ini",
            value: stats.hafalanHariIni,
            icon: BookOpen,
            color: "bg-emerald-500",
        },
        {
            title: "Tasmi' Pending",
            value: stats.tasmiPending,
            icon: ClipboardCheck,
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
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Ustadz</h1>
                <p className="text-muted-foreground mt-1">Pantau perkembangan hafalan santri hari ini.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={`border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden group`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold text-foreground tracking-tight">
                                            {stat.value.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')} dark:text-white`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900/80 dark:to-teal-900/80 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <h3 className="text-xl font-bold mb-6 relative z-10">Menu Cepat</h3>
                <div className="flex flex-wrap gap-4 relative z-10">
                    <Link href="/akademik/lembar">
                        <Button className="bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold shadow-lg border-0 h-11 px-6">
                            <BookOpen className="w-5 h-5 mr-2" />
                            Input Hafalan Lembar
                        </Button>
                    </Link>
                    <Link href="/akademik/tasmi">
                        <Button variant="outline" className="text-white border-white hover:bg-white/20 hover:text-white h-11 px-6">
                            <ClipboardCheck className="w-5 h-5 mr-2" />
                            Input Tasmi&apos;
                        </Button>
                    </Link>
                    <Link href="/presensi">
                        <Button variant="outline" className="text-white border-white hover:bg-white/20 hover:text-white h-11 px-6">
                            <Users className="w-5 h-5 mr-2" />
                            Input Presensi
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Santri Progress */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground">Progres Santri Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentSantri.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Belum ada data</p>
                            ) : (
                                recentSantri.map((santri) => (
                                    <div key={santri.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                                {santri.nama.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{santri.nama}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{santri.nis} • <span className="text-emerald-600 dark:text-emerald-400">{santri.jenjang}</span></p>
                                            </div>
                                        </div>
                                        {santri.lastHafalan && (
                                            <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-0">
                                                {santri.lastHafalan}
                                            </Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events (View Only) */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground">Event Mendatang</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Tidak ada event mendatang</p>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{event.nama}</p>
                                                <p className="text-xs text-muted-foreground">{event.tanggal}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20">
                                            {event.jenis}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
