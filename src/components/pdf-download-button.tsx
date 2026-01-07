"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFDownloadButtonProps {
    data: {
        santri: {
            nama: string;
            nis: string;
            jenjang: string;
            jenis_kelamin: string;
            foto_url?: string | null;
        } | null;
        month: number;
        year: number;
        monthName: string;
        hafalan: {
            lembar: { juz: number; lembar: string; tanggal: string }[];
            tasmi: { juz: number; predikat: string; nilai: number | null; tanggal: string }[];
        };
        presensi: {
            hadir: number;
            izin: number;
            sakit: number;
            alpa: number;
        };
        pelanggaran: { deskripsi: string; poin: number | null; tanggal: string; penyelesaian: string | null }[];
        musyrif_nama: string;
        musyrif_jenis_kelamin: string;
    };
}

export function PDFDownloadButton({ data }: PDFDownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // Dynamic import to avoid SSR issues
            const { pdf } = await import("@react-pdf/renderer");
            const { LaporanPDFDocument } = await import("@/lib/pdf/laporan-template");

            const blob = await pdf(<LaporanPDFDocument data={data} />).toBlob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `Laporan_${data.santri?.nama?.replace(/\s+/g, "_") || "Santri"}_${data.monthName}_${data.year}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Small delay before revoking to ensure download starts
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Gagal membuat PDF. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleDownload}
            disabled={loading}
            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat PDF...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </>
            )}
        </Button>
    );
}
