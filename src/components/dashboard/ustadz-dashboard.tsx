"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, ClipboardCheck, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface UstadzDashboardProps {
    stats: {
        santriCount: number;
        hafalanHariIni: number;
        presensiHariIni: number;
        eventCount: number;
    };
    recentSantri: {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        lastHafalan?: string;
    }[];
    topSantri: {
        id: string;
        nama: string;
        juzCount: number;
    }[];
    recentHafalanSelesai: {
        id: string;
        santriNama: string;
        juz: number;
        tanggal: string;
    }[];
    hafalanPerBulan: {
        bulan: string;
        selesai: number;
    }[];
    upcomingEvents: {
        id: string;
        nama: string;
        tanggal: string;
        jenis: string;
    }[];
}

export function UstadzDashboard({
    stats,
    recentSantri,
    topSantri,
    recentHafalanSelesai,
    hafalanPerBulan,
    upcomingEvents
}: UstadzDashboardProps) {
    const statCards = [
        {
            title: "Total Santri Aktif",
            value: stats.santriCount,
            icon: Users,
            baseColor: "blue",
        },
        {
            title: "Hafalan Hari Ini",
            value: stats.hafalanHariIni,
            icon: BookOpen,
            baseColor: "emerald",
        },
        {
            title: "Presensi Hari Ini",
            value: stats.presensiHariIni,
            icon: ClipboardCheck,
            baseColor: "purple",
        },
        {
            title: "Event Mendatang",
            value: stats.eventCount,
            icon: Calendar,
            baseColor: "orange",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Ustadz</h1>
                <p className="text-muted-foreground mt-1">Pantau perkembangan hafalan dan aktivitas santri.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={`border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl overflow-hidden group`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold text-foreground tracking-tight">
                                            {stat.value.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-${stat.baseColor}-500/10 dark:bg-${stat.baseColor}-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-6 h-6 text-${stat.baseColor}-600 dark:text-white`} />
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

            {/* Hafalan Chart */}
            <Card className="border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Hafalan Selesai per Bulan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hafalanPerBulan}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="bulan" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="selesai" fill="#10b981" radius={[4, 4, 0, 0]} name="Juz Selesai" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Santri Hafalan */}
                <Card className="border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Top Santri Hafalan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {topSantri.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Belum ada data</p>
                            ) : (
                                topSantri.map((santri, index) => (
                                    <div key={santri.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                index === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                                                    index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                                                        "bg-muted text-muted-foreground"
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-foreground">{santri.nama}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                            {santri.juzCount} Juz
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Hafalan Selesai */}
                <Card className="border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-500" />
                            Hafalan Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {recentHafalanSelesai.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Belum ada data</p>
                            ) : (
                                recentHafalanSelesai.map((h) => (
                                    <div key={h.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-foreground">{h.santriNama}</p>
                                            <p className="text-xs text-muted-foreground">{h.tanggal}</p>
                                        </div>
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                            Juz {h.juz}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Event Mendatang
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">Tidak ada event mendatang</p>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-foreground">{event.nama}</p>
                                            <p className="text-xs text-muted-foreground">{event.tanggal}</p>
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

            {/* Recent Santri Progress */}
            <Card className="border border-slate-100 dark:border-border shadow-sm bg-white dark:bg-card/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <CardTitle className="text-lg font-bold text-foreground">Progres Hafalan Lembar Terbaru</CardTitle>
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
        </div>
    );
}
