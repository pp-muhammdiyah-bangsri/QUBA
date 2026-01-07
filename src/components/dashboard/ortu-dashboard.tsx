"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OrtuDashboardProps {
    childInfo: {
        nama: string;
        nis: string;
        jenjang: string;
        status: string;
    } | null;
    hafalanProgress: {
        juzSelesai: number;
        totalJuz: number;
        lastHafalan?: {
            juz: number;
            tanggal: string;
        };
    };
    presensiSummary: {
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
    };
    recentPelanggaran: {
        id: string;
        deskripsi: string;
        tanggal: string;
        poin?: number;
    }[];
    recentPerizinan: {
        id: string;
        alasan: string;
        status: string;
        tglMulai: string;
        tglSelesai: string;
    }[];
    upcomingEvents: {
        id: string;
        nama: string;
        tanggal: string;
        lokasi: string;
        jenis: string;
    }[];
}

export function OrtuDashboard({
    childInfo,
    hafalanProgress,
    presensiSummary,
    recentPelanggaran,
    recentPerizinan,
    upcomingEvents,
}: OrtuDashboardProps) {
    const progressPercent = hafalanProgress.totalJuz > 0
        ? Math.round((hafalanProgress.juzSelesai / hafalanProgress.totalJuz) * 100)
        : 0;

    if (!childInfo) {
        return (
            <div className="flex items-center justify-center h-64">
                <Card className="border-0 shadow-md p-8 text-center bg-card">
                    <p className="text-muted-foreground">
                        Data anak belum terhubung dengan akun Anda.
                    </p>
                    <p className="text-sm text-muted-foreground/80 mt-2">
                        Silakan hubungi administrator untuk menghubungkan akun.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Orang Tua</h1>
                <p className="text-muted-foreground mt-1">Pantau perkembangan pendidikan anak Anda.</p>
            </div>

            {/* Child Info Card - Premium Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl dark:shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 opacity-10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-inner">
                            {childInfo.nama.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-emerald-100 font-medium mb-1">Data Santri</p>
                            <h2 className="text-3xl font-bold tracking-tight text-white">{childInfo.nama}</h2>
                            <p className="text-emerald-100 opacity-90 mt-1 flex items-center gap-2">
                                <span className="bg-white/10 px-3 py-0.5 rounded-full text-sm backdrop-blur-sm">NIS: {childInfo.nis}</span>
                                <span className="bg-white/10 px-3 py-0.5 rounded-full text-sm backdrop-blur-sm">{childInfo.jenjang}</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <Badge className={`px-4 py-2 text-sm backdrop-blur-md border border-white/20 shadow-lg ${childInfo.status === "aktif"
                            ? "bg-emerald-500/20 text-white"
                            : "bg-yellow-500/20 text-yellow-100"
                            }`}>
                            Status: {childInfo.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Grid: Hafalan & Presensi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hafalan Progress */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            Progres Hafalan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">Total Pencapaian</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {hafalanProgress.juzSelesai} <span className="text-sm text-muted-foreground font-normal">/ {hafalanProgress.totalJuz} Juz</span>
                                    </span>
                                </div>
                                <Progress value={progressPercent} className="h-3 rounded-full bg-emerald-100 dark:bg-emerald-950/50" />
                                <p className="text-xs text-muted-foreground mt-2 text-right font-medium">{progressPercent}% selesai</p>
                            </div>

                            {hafalanProgress.lastHafalan ? (
                                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 font-bold mb-1">Setoran Terakhir</p>
                                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Juz {hafalanProgress.lastHafalan.juz}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-white/50 dark:bg-black/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                                            {hafalanProgress.lastHafalan.tanggal}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">Belum ada data hafalan</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Presensi Summary */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Presensi Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="flex flex-col justify-center p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors">
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Hadir</span>
                                <span className="text-3xl font-bold text-green-600 dark:text-green-500 mt-1">{presensiSummary.hadir}</span>
                            </div>
                            <div className="flex flex-col justify-center p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Izin</span>
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-500 mt-1">{presensiSummary.izin}</span>
                            </div>
                            <div className="flex flex-col justify-center p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20 transition-colors">
                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Sakit</span>
                                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-1">{presensiSummary.sakit}</span>
                            </div>
                            <div className="flex flex-col justify-center p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors">
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">Alpa</span>
                                <span className="text-3xl font-bold text-red-600 dark:text-red-500 mt-1">{presensiSummary.alpa}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Grid: Pelanggaran & Perizinan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pelanggaran */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            </div>
                            Catatan Pelanggaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {recentPelanggaran.length === 0 ? (
                                <div className="text-center py-10 px-6">
                                    <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-foreground font-semibold">Alhamdulillah, Bersih!</p>
                                    <p className="text-sm text-muted-foreground mt-1">Tidak ada catatan pelanggaran akhir-akhir ini.</p>
                                </div>
                            ) : (
                                recentPelanggaran.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex justify-between items-start gap-3">
                                            <p className="text-sm font-medium text-foreground line-clamp-2">{item.deskripsi}</p>
                                            {item.poin && (
                                                <Badge variant="destructive" className="shrink-0 whitespace-nowrap">
                                                    {item.poin} poin
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">{item.tanggal}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Perizinan */}
                <Card className="border-0 shadow-lg shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            Riwayat Perizinan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {recentPerizinan.length === 0 ? (
                                <div className="text-center py-10 px-6 text-muted-foreground">
                                    Belum ada data riwayat perizinan
                                </div>
                            ) : (
                                recentPerizinan.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <p className="text-sm font-medium text-foreground line-clamp-1">{item.alasan}</p>
                                            <Badge
                                                variant={
                                                    item.status === "approved" ? "success" :
                                                        item.status === "rejected" ? "destructive" : "secondary"
                                                }
                                                className="shrink-0 text-[10px] uppercase tracking-wider"
                                            >
                                                {item.status === "approved" ? "Disetujui" :
                                                    item.status === "rejected" ? "Ditolak" : "Menunggu"}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {item.tglMulai} - {item.tglSelesai}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events Section */}
            <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Kegiatan Mendatang
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                            <Card key={event.id} className="border-0 shadow-md shadow-gray-100/50 dark:shadow-none dark:bg-card/50 dark:border dark:border-border hover:shadow-xl transition-all duration-300 overflow-hidden group border-l-4 border-l-emerald-500 dark:border-l-emerald-400 hover:-translate-y-1">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors"
                                        >
                                            {event.jenis}
                                        </Badge>
                                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                                            {event.tanggal}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {event.nama}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-700"></div>
                                        <span className="line-clamp-1">{event.lokasi}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full border-dashed border-2 border-border shadow-none bg-muted/30">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground/30 mb-3" />
                                <p className="text-foreground font-medium">Belum ada kegiatan mendatang</p>
                                <p className="text-sm text-muted-foreground">Informasi kegiatan sekolah akan muncul di sini</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
