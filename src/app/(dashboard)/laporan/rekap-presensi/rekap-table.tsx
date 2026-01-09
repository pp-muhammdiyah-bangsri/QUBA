"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Filter, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { RekapPdfDocument, RekapPdfMultiDocument } from "./rekap-pdf";


interface Option {
    id: string;
    nama: string;
}

interface SantriRekap {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    jenis_kelamin: string;
}

interface SantriMultiRekap {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    jenis_kelamin: string;
    activities: Record<string, { hadir: number; total: number }>;
}

interface RekapTableProps {
    data: SantriRekap[];
    multiData: SantriMultiRekap[];
    activities: string[];
    activityTotals: Record<string, number>;
    totalKegiatan: number;
    kelasList: Option[];
    halaqohList: Option[];
    kegiatanList: string[];
    isMultiMode: boolean;
}

export function RekapTable({
    data,
    multiData,
    activities,
    activityTotals,
    totalKegiatan,
    kelasList,
    halaqohList,
    kegiatanList,
    isMultiMode
}: RekapTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [month, setMonth] = useState(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const [year, setYear] = useState(searchParams.get("year") || new Date().getFullYear().toString());
    const [filterType, setFilterType] = useState(searchParams.get("type") || "all");
    const [filterId, setFilterId] = useState(searchParams.get("id") || "");
    const [kegiatanName, setKegiatanName] = useState(searchParams.get("kegiatan") || "");
    const [gender, setGender] = useState(searchParams.get("gender") || "all");

    const handleApplyFilter = () => {
        const params = new URLSearchParams();
        params.set("month", month);
        params.set("year", year);
        params.set("type", filterType);
        if (filterId) params.set("id", filterId);
        if (kegiatanName) params.set("kegiatan", kegiatanName);
        if (gender !== "all") params.set("gender", gender);

        router.push(`/laporan/rekap-presensi?${params.toString()}`);
    };

    const handleExportExcel = () => {
        if (isMultiMode) {
            // Multi-activity Excel
            const rows = multiData.map(row => {
                const rowData: Record<string, string | number> = {
                    "Nama Santri": row.nama,
                    "Jenjang": row.jenjang,
                    "L/P": row.jenis_kelamin,
                };
                activities.forEach(act => {
                    const stats = row.activities[act] || { hadir: 0, total: 0 };
                    rowData[act] = `${stats.hadir}/${activityTotals[act] || stats.total}`;
                });
                return rowData;
            });
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");
            XLSX.writeFile(workbook, `Rekap_Presensi_${month}_${year}.xlsx`);
        } else {
            // Single activity Excel
            const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
                "Nama Santri": row.nama,
                "Jenjang": row.jenjang,
                "L/P": row.jenis_kelamin,
                "Hadir": row.hadir,
                "Izin": row.izin,
                "Sakit": row.sakit,
                "Alpa": row.alpa,
                "% Kehadiran": getPercentage(row.hadir) + "%"
            })));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi");
            XLSX.writeFile(workbook, `Rekap_Presensi_${month}_${year}.xlsx`);
        }
    };

    const handleExportPdf = async () => {
        try {
            const { pdf } = await import("@react-pdf/renderer");

            // Get group name for title
            let groupName = "";
            if (filterType === "kelas" && filterId) {
                groupName = kelasList.find(k => k.id === filterId)?.nama || "";
            } else if (filterType === "halaqoh" && filterId) {
                groupName = halaqohList.find(h => h.id === filterId)?.nama || "";
            }

            if (isMultiMode) {
                const blob = await pdf(
                    <RekapPdfMultiDocument
                        data={multiData}
                        activities={activities}
                        activityTotals={activityTotals}
                        month={month}
                        year={year}
                        gender={gender}
                        isSholat={kegiatanName === "__SHOLAT__"}
                        filterType={filterType}
                        groupName={groupName}
                    />
                ).toBlob();
                saveAs(blob, `Rekap_Presensi_${month}_${year}.pdf`);
            } else {
                const blob = await pdf(
                    <RekapPdfDocument
                        data={data}
                        month={month}
                        year={year}
                        kegiatan={kegiatanName}
                        gender={gender}
                        filterType={filterType}
                        groupName={groupName}
                    />
                ).toBlob();
                saveAs(blob, `Rekap_Presensi_${month}_${year}.pdf`);
            }
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Gagal membuat PDF. Pastikan data valid.");
        }
    };

    const getPercentage = (hadir: number) => {
        if (totalKegiatan === 0) return 0;
        return Math.round((hadir / totalKegiatan) * 100);
    };

    const displayData = isMultiMode ? multiData : data;

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter Laporan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Bulan</Label>
                            <Select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Kelamin</Label>
                            <Select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="all">Semua</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun</Label>
                            <Select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Kegiatan</Label>
                            <SearchableSelect
                                value={kegiatanName}
                                onChange={setKegiatanName}
                                placeholder="Semua (Kecuali Sholat)"
                                searchPlaceholder="Cari kegiatan..."
                                emptyText="Tidak ditemukan"
                                options={[
                                    { value: "", label: "Semua (Kecuali Sholat)" },
                                    { value: "__SHOLAT__", label: "🕌 Rekap Sholat" },
                                    ...kegiatanList.map((opt) => ({ value: opt, label: opt })),
                                ]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe Grup</Label>
                            <Select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setFilterId("");
                                }}
                            >
                                <option value="all">Semua</option>
                                <option value="kelas">Kelas</option>
                                <option value="halaqoh">Halaqoh</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pilih Grup</Label>
                            <Select
                                value={filterId}
                                onChange={(e) => setFilterId(e.target.value)}
                                disabled={filterType === "all"}
                            >
                                <option value="">-- Semua --</option>
                                {filterType === "kelas" && kelasList.map((k) => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                ))}
                                {filterType === "halaqoh" && halaqohList.map((h) => (
                                    <option key={h.id} value={h.id}>{h.nama}</option>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handleApplyFilter} className="w-full">
                            Terapkan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {isMultiMode ? activities.length : totalKegiatan}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                            {isMultiMode ? "Jenis Kegiatan" : "Total Kegiatan"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{displayData.length}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Total Santri</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-card border-dashed">
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-2">
                        <Button variant="outline" size="sm" className="w-full" onClick={handleExportExcel}>
                            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                            Export Excel
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={handleExportPdf}>
                            <FileText className="w-4 h-4 mr-2 text-red-600" />
                            Export PDF
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    {isMultiMode ? (
                        /* Multi-Activity Table */
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 bg-white dark:bg-card z-10">Santri</TableHead>
                                    <TableHead>Jenjang</TableHead>
                                    {activities.map((act) => (
                                        <TableHead key={act} className="text-center min-w-[80px]">
                                            {act}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {multiData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2 + activities.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            Tidak ada data presensi untuk filter ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    multiData.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="sticky left-0 bg-white dark:bg-card z-10">
                                                <div>
                                                    <div className="font-medium">{row.nama}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{row.nis}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{row.jenjang}</Badge>
                                            </TableCell>
                                            {activities.map((act) => {
                                                const stats = row.activities[act] || { hadir: 0, total: 0 };
                                                const total = activityTotals[act] || stats.total;
                                                const percentage = total > 0 ? Math.round((stats.hadir / total) * 100) : 0;
                                                let colorClass = "bg-green-50 dark:bg-green-900/20";
                                                if (percentage < 50) colorClass = "bg-red-50 dark:bg-red-900/20";
                                                else if (percentage < 75) colorClass = "bg-yellow-50 dark:bg-yellow-900/20";

                                                return (
                                                    <TableCell key={act} className={`text-center ${colorClass}`}>
                                                        {stats.hadir}/{total}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        /* Single Activity Table (Original) */
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Santri</TableHead>
                                    <TableHead>Jenjang</TableHead>
                                    <TableHead className="text-center">Hadir</TableHead>
                                    <TableHead className="text-center">Izin</TableHead>
                                    <TableHead className="text-center">Sakit</TableHead>
                                    <TableHead className="text-center">Alpha</TableHead>
                                    <TableHead className="text-right">% Kehadiran</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            Tidak ada data presensi untuk filter ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row) => {
                                        const percentage = getPercentage(row.hadir);
                                        let colorClass = "text-green-600 dark:text-green-400";
                                        if (percentage < 50) colorClass = "text-red-500 dark:text-red-400 font-bold";
                                        else if (percentage < 75) colorClass = "text-yellow-600 dark:text-yellow-400";

                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{row.nama}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.nis}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{row.jenjang}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center bg-green-50 dark:bg-green-900/20">{row.hadir}</TableCell>
                                                <TableCell className="text-center">{row.izin}</TableCell>
                                                <TableCell className="text-center">{row.sakit}</TableCell>
                                                <TableCell className="text-center bg-red-50 dark:bg-red-900/20">{row.alpa}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={colorClass}>{percentage}%</span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
