"use client";

import { useEffect, useState } from "react";
import { getLaporanKinerja, KinerjaUstadzStat } from "./actions";
import { KinerjaPdfDocument } from "./kinerja-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function KinerjaUstadzPage() {
    const [stats, setStats] = useState<KinerjaUstadzStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
    const [year, setYear] = useState<string>(new Date().getFullYear() + "");

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getLaporanKinerja(parseInt(month), parseInt(year));
            setStats(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    const handleExportPdf = async () => {
        try {
            const blob = await pdf(
                <KinerjaPdfDocument data={stats} month={month} year={year} />
            ).toBlob();
            saveAs(blob, `Laporan_Kinerja_Ustadz_${month}_${year}.pdf`);
        } catch (error) {
            console.error("PDF generation failed", error);
            alert("Gagal membuat PDF");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Laporan Kinerja Ustadz</h1>
                    <p className="text-gray-500">Monitoring kepatuhan input presensi per Grup</p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-[140px] p-2 border rounded-md"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={(i + 1).toString()}>
                                {format(new Date(2024, i, 1), "MMMM", { locale: id })}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-[100px] p-2 border rounded-md"
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y.toString()}>{y}</option>
                        ))}
                    </select>

                    <Button variant="outline" onClick={handleExportPdf} disabled={loading || stats.length === 0}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Kepatuhan</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data kegiatan di periode ini.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Ustadz</TableHead>
                                    <TableHead>Role & Grup</TableHead>
                                    <TableHead className="text-center">Total Kegiatan</TableHead>
                                    <TableHead className="text-center">Diisi</TableHead>
                                    <TableHead className="text-center">Kepatuhan</TableHead>
                                    <TableHead>Missed Log</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.map((s) => (
                                    <TableRow key={s.ustadz_id} className={s.persentase < 100 ? "bg-red-50" : ""}>
                                        <TableCell className="font-medium">{s.nama_ustadz}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{s.group_name}</div>
                                            <div className="text-xs text-gray-500">{s.role_type}</div>
                                        </TableCell>
                                        <TableCell className="text-center">{s.total_kegiatan}</TableCell>
                                        <TableCell className="text-center">{s.total_diisi}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.persentase === 100 ? "bg-green-100 text-green-700" :
                                                s.persentase >= 80 ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-red-100 text-red-700"
                                                }`}>
                                                {s.persentase}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-red-600 max-w-[300px] truncate">
                                            {s.kegiatan_missed.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {s.kegiatan_missed.slice(0, 3).map((m, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {m.nama_kegiatan} ({format(new Date(m.tanggal), "dd/MM")})
                                                        </span>
                                                    ))}
                                                    {s.kegiatan_missed.length > 3 && <span>... (+{s.kegiatan_missed.length - 3})</span>}
                                                </div>
                                            ) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
