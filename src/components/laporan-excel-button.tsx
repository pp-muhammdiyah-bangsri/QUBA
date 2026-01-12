"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LaporanData {
    santri: {
        nama: string;
        nis: string;
        jenjang: string;
        jenis_kelamin: string;
    } | null;
    month: number;
    year: number;
    monthName: string;
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
}

interface LaporanExcelButtonProps {
    data: LaporanData;
}

export function LaporanExcelButton({ data }: LaporanExcelButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const XLSX = await import("xlsx");
            const workbook = XLSX.utils.book_new();

            // Sheet 1: Info Santri
            const infoData = [
                ["LAPORAN BULANAN SANTRI"],
                ["Periode", `${data.monthName} ${data.year}`],
                [],
                ["Nama", data.santri?.nama || "-"],
                ["NIS", data.santri?.nis || "-"],
                ["Jenjang", data.santri?.jenjang || "-"],
                ["Jenis Kelamin", data.santri?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
            ];
            const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(workbook, infoSheet, "Info");

            // Sheet 2: Hafalan Lembar
            if (data.hafalan.lembar.length > 0) {
                const lembarData = data.hafalan.lembar.map((h) => ({
                    Tanggal: new Date(h.tanggal).toLocaleDateString("id-ID"),
                    Juz: h.juz,
                    Lembar: h.lembar,
                }));
                const lembarSheet = XLSX.utils.json_to_sheet(lembarData);
                XLSX.utils.book_append_sheet(workbook, lembarSheet, "Hafalan Lembar");
            }

            // Sheet 3: Tasmi
            if (data.hafalan.tasmi.length > 0) {
                const tasmiData = data.hafalan.tasmi.map((t) => ({
                    Tanggal: new Date(t.tanggal).toLocaleDateString("id-ID"),
                    Juz: t.juz,
                    Predikat: t.predikat,
                    Nilai: t.nilai || "-",
                }));
                const tasmiSheet = XLSX.utils.json_to_sheet(tasmiData);
                XLSX.utils.book_append_sheet(workbook, tasmiSheet, "Tasmi");
            }

            // Sheet 4: Presensi (categorized format)
            const totalHadir = data.presensi.sholat.hadir + data.presensi.kbm.hadir + data.presensi.halaqoh.hadir + data.presensi.lainnya.hadir;
            const totalKegiatan = data.presensi.sholat.total + data.presensi.kbm.total + data.presensi.halaqoh.total + data.presensi.lainnya.total;
            const presensiDataSheet = [
                ["Kategori", "Hadir", "Total"],
                ["Sholat", data.presensi.sholat.hadir, data.presensi.sholat.total],
                ["KBM", data.presensi.kbm.hadir, data.presensi.kbm.total],
                ["Halaqoh", data.presensi.halaqoh.hadir, data.presensi.halaqoh.total],
                ["Kegiatan Lain", data.presensi.lainnya.hadir, data.presensi.lainnya.total],
                ["Total", totalHadir, totalKegiatan],
            ];
            const presensiSheet = XLSX.utils.aoa_to_sheet(presensiDataSheet);
            XLSX.utils.book_append_sheet(workbook, presensiSheet, "Presensi");

            // Sheet 5: Pelanggaran
            if (data.pelanggaran.length > 0) {
                const pelanggaranData = data.pelanggaran.map((p) => ({
                    Tanggal: new Date(p.tanggal).toLocaleDateString("id-ID"),
                    Deskripsi: p.deskripsi,
                    Poin: p.poin || "-",
                    Status: p.penyelesaian ? "Selesai" : "Belum",
                }));
                const pelanggaranSheet = XLSX.utils.json_to_sheet(pelanggaranData);
                XLSX.utils.book_append_sheet(workbook, pelanggaranSheet, "Pelanggaran");
            }

            // Generate filename and download
            // Generate filename and download
            const filename = `Laporan_${data.santri?.nama?.replace(/\s+/g, "_") || "Santri"}_${data.monthName}_${data.year}`;

            // Generate buffer and create download manually for better control
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("Error exporting Excel:", error);
            alert("Gagal mengekspor data. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengekspor...
                </>
            ) : (
                <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel
                </>
            )}
        </Button>
    );
}
