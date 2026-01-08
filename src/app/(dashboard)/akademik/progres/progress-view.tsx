"use client";

import { useState } from "react";
import { Search, BookOpen, TrendingUp, Award, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortName } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface SantriProgress {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    juzSelesai: number[]; // Array of completed juz numbers
    sedangDihafal: { juz: number; lembar: number }[]; // In-progress juz with lembar count
    lembarTotal: number;
}

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
}

interface ProgressViewProps {
    initialData: SantriProgress[];
    santriList: SantriOption[];
}

export function ProgressView({ initialData }: ProgressViewProps) {
    const [data] = useState<SantriProgress[]>(initialData);
    const [search, setSearch] = useState("");

    const filteredData = data.filter(
        (item) =>
            item.nama.toLowerCase().includes(search.toLowerCase()) ||
            item.nis.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate summary stats
    const totalSantri = data.length;
    const totalJuzSelesai = data.reduce((sum, s) => sum + s.juzSelesai.length, 0);
    const totalSedangDihafal = data.reduce((sum, s) => sum + s.sedangDihafal.length, 0);
    const avgJuz = totalSantri > 0 ? (totalJuzSelesai / totalSantri).toFixed(1) : "0";

    // Prepare chart data - Top 10 by Juz completed
    const chartData = [...data]
        .sort((a, b) => b.juzSelesai.length - a.juzSelesai.length)
        .slice(0, 10)
        .map((s) => ({
            name: formatShortName(s.nama),
            juz: s.juzSelesai.length,
            lembar: s.lembarTotal,
        }));

    // Distribution by juz count
    const distribution = data.reduce((acc, s) => {
        const count = s.juzSelesai.length;
        const range = count === 0 ? "0 Juz" :
            count <= 5 ? "1-5 Juz" :
                count <= 10 ? "6-10 Juz" :
                    count <= 20 ? "11-20 Juz" : "21-30 Juz";
        acc[range] = (acc[range] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const distributionData = Object.entries(distribution).map(([name, value]) => ({ name, value }));

    const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

    // Helper: format juz list as string (e.g., "Juz 1, 2, 3...")
    const formatJuzList = (juzArray: number[]) => {
        if (juzArray.length === 0) return "-";
        if (juzArray.length <= 5) {
            return "Juz " + juzArray.join(", ");
        }
        return `Juz ${juzArray.slice(0, 4).join(", ")}... (+${juzArray.length - 4})`;
    };

    // Helper: format in-progress juz
    const formatSedangDihafal = (items: { juz: number; lembar: number }[]) => {
        if (items.length === 0) return "-";
        return items.map(i => `Juz ${i.juz} (${i.lembar}/20)`).join(", ");
    };

    // Calculate progress percentage for in-progress juz only (resets when completed)
    const calculateProgress = (item: SantriProgress) => {
        if (item.sedangDihafal.length === 0) return 0;
        // Show progress of the first in-progress juz only
        const currentJuz = item.sedangDihafal[0];
        return (currentJuz.lembar / 20) * 100;
    };

    // Get current juz label for progress
    const getCurrentJuzLabel = (item: SantriProgress) => {
        if (item.sedangDihafal.length === 0) return null;
        return `Juz ${item.sedangDihafal[0].juz}`;
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border dark:border-blue-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalSantri}</div>
                                <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Santri</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border dark:border-emerald-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalJuzSelesai}</div>
                                <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Total Juz Selesai</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40 dark:border dark:border-purple-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/50">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{totalSedangDihafal}</div>
                                <div className="text-sm text-purple-600/80 dark:text-purple-400/80">Juz Sedang Dihafal</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 dark:border dark:border-orange-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-100 dark:border-orange-800/50">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{avgJuz}</div>
                                <div className="text-sm text-orange-600/80 dark:text-orange-400/80">Rata-rata Juz</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Top 10 Santri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} vertical={false} />
                                <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={80} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="juz" fill="#10b981" radius={[0, 4, 4, 0]} name="Juz Selesai" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Distribusi Hafalan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={distributionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.2} vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Jumlah Santri">
                                    {distributionData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Table */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari santri..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead>Juz Selesai</TableHead>
                                <TableHead>Sedang Dihafal</TableHead>
                                <TableHead>Progress</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data santri"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData
                                    .sort((a, b) => b.juzSelesai.length - a.juzSelesai.length)
                                    .map((item, idx) => {
                                        const progress = calculateProgress(item);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-foreground">{item.nama}</div>
                                                        <div className="text-xs text-muted-foreground">{item.nis}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.jenjang === "SMP" ? "secondary" : "default"}>
                                                        {item.jenjang}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px]">
                                                        <span className="text-emerald-600 font-medium">
                                                            {formatJuzList(item.juzSelesai)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px] text-sm text-purple-600">
                                                        {formatSedangDihafal(item.sedangDihafal)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.sedangDihafal.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs text-gray-500">
                                                                {getCurrentJuzLabel(item)}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-emerald-500 h-2 rounded-full transition-all"
                                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-medium text-emerald-600">
                                                                    {progress.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
