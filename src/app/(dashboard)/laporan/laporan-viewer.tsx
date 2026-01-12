"use client";

import { useState, useEffect } from "react";
import { FileText, Download, BookOpen, Calendar, AlertTriangle, Award, CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getLaporanData } from "./actions";
import { PDFDownloadButton } from "@/components/pdf-download-button";
import { LaporanExcelButton } from "@/components/laporan-excel-button";

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
}

interface MonthOption {
    value: number;
    label: string;
}

interface LaporanViewerProps {
    santriList: SantriOption[];
    monthOptions: MonthOption[];
    yearOptions: number[];
    userRole?: string;
    linkedSantriId?: string | null;
}

interface LaporanData {
    santri: {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        jenis_kelamin: string;
        foto_url: string | null;
    } | null;
    musyrif_nama: string;
    musyrif_jenis_kelamin: string;
    month: number;
    year: number;
    hafalan: {
        lembar: { juz: number; lembar: string; tanggal: string }[];
        tasmi: { juz: number; predikat: string; nilai: number | null; tanggal: string }[];
    };
    presensi: {
        sholat: { hadir: number; total: number };
        kbm: { hadir: number; total: number };
        halaqoh: { hadir: number; total: number };
        lainnya: { hadir: number; total: number };
    };
    pelanggaran: { deskripsi: string; poin: number | null; tanggal: string; penyelesaian: string | null }[];
    perizinan: { alasan: string; status: string; tgl_mulai: string; tgl_selesai: string }[];
}

const predikatColors: Record<string, string> = {
    mumtaz: "bg-green-100 text-green-800",
    jayyid: "bg-blue-100 text-blue-800",
    maqbul: "bg-yellow-100 text-yellow-800",
};



export function LaporanViewer({ santriList, monthOptions, yearOptions, userRole = "admin", linkedSantriId }: LaporanViewerProps) {
    const currentDate = new Date();
    const [selectedSantri, setSelectedSantri] = useState(userRole === "ortu" && linkedSantriId ? linkedSantriId : "");
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [laporanData, setLaporanData] = useState<LaporanData | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoLoaded, setAutoLoaded] = useState(false);

    // Auto-load for Ortu on mount
    useEffect(() => {
        if (userRole === "ortu" && linkedSantriId && !autoLoaded) {
            setAutoLoaded(true);
            const loadData = async () => {
                setLoading(true);
                try {
                    const data = await getLaporanData(linkedSantriId, selectedMonth, selectedYear);
                    setLaporanData(data);
                } catch (err) {
                    console.error("Error loading laporan:", err);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [userRole, linkedSantriId, selectedMonth, selectedYear, autoLoaded]);

    const handleLoadLaporan = async () => {
        if (!selectedSantri) return;
        setLoading(true);
        try {
            const data = await getLaporanData(selectedSantri, selectedMonth, selectedYear);
            setLaporanData(data);
        } catch (err) {
            console.error("Error loading laporan:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const monthName = monthOptions.find((m) => m.value === selectedMonth)?.label || "";

    // Calculate total attendance from all categories
    const totalHadir = laporanData
        ? laporanData.presensi.sholat.hadir + laporanData.presensi.kbm.hadir + laporanData.presensi.halaqoh.hadir + laporanData.presensi.lainnya.hadir
        : 0;
    const totalKegiatan = laporanData
        ? laporanData.presensi.sholat.total + laporanData.presensi.kbm.total + laporanData.presensi.halaqoh.total + laporanData.presensi.lainnya.total
        : 0;

    return (
        <div className="space-y-6">
            {/* Selection Controls */}
            <Card className="border-0 shadow-md print:hidden">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        {userRole !== "ortu" && (
                            <div className="space-y-2">
                                <Label>Pilih Santri</Label>
                                <SearchableSelect
                                    options={santriList.map((s) => ({
                                        value: s.id,
                                        label: s.nama,
                                        sublabel: `NIS: ${s.nis}`,
                                    }))}
                                    value={selectedSantri}
                                    onChange={(value) => setSelectedSantri(value)}
                                    placeholder="-- Pilih Santri --"
                                    searchPlaceholder="Ketik nama santri..."
                                    emptyText="Santri tidak ditemukan"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Bulan</Label>
                            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                                {monthOptions.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun</Label>
                            <Select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handleLoadLaporan} disabled={loading || !selectedSantri}>
                            {loading ? "Memuat..." : "Tampilkan Laporan"}
                        </Button>
                        {laporanData && (
                            <>
                                <PDFDownloadButton
                                    data={{
                                        ...laporanData,
                                        monthName
                                    }}
                                />
                                <LaporanExcelButton
                                    data={{
                                        ...laporanData,
                                        monthName
                                    }}
                                />
                                <Button variant="outline" onClick={handlePrint}>
                                    <Printer className="w-4 h-4 mr-2" /> Cetak
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Report Content */}
            {laporanData && (
                <div className="space-y-6 print:space-y-4" id="laporan-content">
                    {/* Header */}
                    <Card className="border-0 shadow-md print:shadow-none print:border">
                        <CardContent className="p-6 print:p-4">
                            <div className="text-center mb-6 print:mb-4">
                                <h2 className="text-2xl font-bold print:text-xl">LAPORAN BULANAN SANTRI</h2>
                                <p className="text-gray-600">Periode: {monthName} {laporanData.year}</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 mt-4 pt-4 border-t items-center md:items-start text-center md:text-left">
                                <div className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={laporanData.santri?.foto_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                        alt="Foto Santri"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm flex-1 w-full text-left">
                                    <div className="space-y-1">
                                        <div className="grid grid-cols-[100px_auto] gap-2">
                                            <span className="text-gray-500">Nama</span>
                                            <span className="font-medium">: {laporanData.santri ? laporanData.santri.nama : "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_auto] gap-2">
                                            <span className="text-gray-500">NIS</span>
                                            <span className="font-medium">: {laporanData.santri?.nis}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="grid grid-cols-[100px_auto] gap-2">
                                            <span className="text-gray-500">Jenjang</span>
                                            <span className="font-medium">: {laporanData.santri?.jenjang}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_auto] gap-2">
                                            <span className="text-gray-500">Jenis Kelamin</span>
                                            <span className="font-medium">: {laporanData.santri?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Summary Cards */}
                    < div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-2" >
                        <Card className="border-0 shadow-sm bg-emerald-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-8 h-8 text-emerald-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-emerald-700 print:text-lg">{laporanData.hafalan.lembar.length}</div>
                                        <div className="text-xs text-emerald-600">Hafalan Lembar</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-blue-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <Award className="w-8 h-8 text-blue-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-blue-700 print:text-lg">{laporanData.hafalan.tasmi.length}</div>
                                        <div className="text-xs text-blue-600">Tasmi</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-green-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-8 h-8 text-green-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-green-700 print:text-lg">{totalHadir}/{totalKegiatan}</div>
                                        <div className="text-xs text-green-600">Kehadiran</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-red-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-8 h-8 text-red-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-red-700 print:text-lg">{laporanData.pelanggaran.length}</div>
                                        <div className="text-xs text-red-600">Pelanggaran</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div >

                    {/* Hafalan Detail */}
                    < Card className="border-0 shadow-md print:shadow-none print:border" >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg print:text-base">Perkembangan Hafalan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                                <div>
                                    <h4 className="font-medium mb-2 text-sm">Hafalan Lembar</h4>
                                    {laporanData.hafalan.lembar.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Tidak ada hafalan lembar bulan ini</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Tanggal</TableHead>
                                                    <TableHead className="text-xs">Juz</TableHead>
                                                    <TableHead className="text-xs">Lembar</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {laporanData.hafalan.lembar.slice(0, 10).map((h, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="text-xs">
                                                            {new Date(h.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                                        </TableCell>
                                                        <TableCell className="text-xs">{h.juz}</TableCell>
                                                        <TableCell className="text-xs">{h.lembar}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2 text-sm">Tasmi (Ujian)</h4>
                                    {laporanData.hafalan.tasmi.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Tidak ada tasmi bulan ini</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Tanggal</TableHead>
                                                    <TableHead className="text-xs">Juz</TableHead>
                                                    <TableHead className="text-xs">Predikat</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {laporanData.hafalan.tasmi.map((t, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="text-xs">
                                                            {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                                        </TableCell>
                                                        <TableCell className="text-xs">{t.juz}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`text-xs ${predikatColors[t.predikat]}`}>
                                                                {t.predikat.charAt(0).toUpperCase() + t.predikat.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card >

                    {/* Presensi Summary */}
                    < Card className="border-0 shadow-md print:shadow-none print:border" >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg print:text-base">Rekap Kehadiran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4 text-center print:gap-2">
                                <div className="p-3 bg-blue-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-blue-700 print:text-lg">{laporanData.presensi.sholat.hadir}/{laporanData.presensi.sholat.total}</div>
                                    <div className="text-sm text-blue-600">Sholat</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-green-700 print:text-lg">{laporanData.presensi.kbm.hadir}/{laporanData.presensi.kbm.total}</div>
                                    <div className="text-sm text-green-600">KBM</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-yellow-700 print:text-lg">{laporanData.presensi.halaqoh.hadir}/{laporanData.presensi.halaqoh.total}</div>
                                    <div className="text-sm text-yellow-600">Halaqoh</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-purple-700 print:text-lg">{laporanData.presensi.lainnya.hadir}/{laporanData.presensi.lainnya.total}</div>
                                    <div className="text-sm text-purple-600">Kegiatan Lain</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card >

                    {/* Pelanggaran */}
                    {
                        laporanData.pelanggaran.length > 0 && (
                            <Card className="border-0 shadow-md print:shadow-none print:border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg print:text-base text-red-700">Catatan Pelanggaran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead>Poin</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {laporanData.pelanggaran.map((p, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-sm">{new Date(p.tanggal).toLocaleDateString("id-ID")}</TableCell>
                                                    <TableCell className="text-sm">{p.deskripsi}</TableCell>
                                                    <TableCell className="text-sm font-medium text-red-600">{p.poin || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={p.penyelesaian ? "success" : "destructive"}>
                                                            {p.penyelesaian ? "Selesai" : "Belum"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )
                    }
                    {/* Signature Section */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center print:mt-8 break-inside-avoid print:grid-cols-2">
                        <div className="space-y-16">
                            <div>
                                <p className="mb-1">Mengetahui,</p>
                                <p className="font-medium">Mudir Ponpes Muhammadiyah Bangsri</p>
                            </div>
                            <p className="font-medium underline decoration-1 underline-offset-4">
                                H. Aris Bastian, S.Pt.
                            </p>
                        </div>
                        <div className="space-y-16">
                            <div>
                                <p className="mb-1">Jepara, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                                <p className="font-medium">
                                    {laporanData.musyrif_jenis_kelamin === "P" ? "Musyrifah" : "Musyrif"} Halaqoh
                                </p>
                            </div>
                            <p className="font-medium underline decoration-1 underline-offset-4">
                                {laporanData.musyrif_nama || "........................................"}
                            </p>
                        </div>
                    </div>
                </div >
            )
            }

            {/* Empty State */}
            {
                !laporanData && !loading && (
                    <Card className="border-0 shadow-md print:hidden">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">Pilih santri dan periode untuk melihat laporan bulanan</p>
                        </CardContent>
                    </Card>
                )
            }
        </div >
    );
}
