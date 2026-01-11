"use client";

import { useState, useEffect } from "react";
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
    const [loading, setLoading] = useState(true);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const generatePdf = async () => {
            setLoading(true);
            try {
                const { pdf } = await import("@react-pdf/renderer");
                const { LaporanPDFDocument } = await import("@/lib/pdf/laporan-template");
                const { optimizeImage } = await import("@/lib/image-optimizer");

                // Optimize photo unique to this santri (resize to max 200px width)
                // This drastically reduces PDF generation time for large uploaded photos
                let processedPhoto = null;
                if (data.santri?.foto_url) {
                    processedPhoto = await optimizeImage(data.santri.foto_url);
                }

                const pdfData = {
                    ...data,
                    processedPhoto
                };

                const blob = await pdf(<LaporanPDFDocument data={pdfData} />).toBlob();
                const url = URL.createObjectURL(blob);

                if (isMounted) {
                    setBlobUrl(url);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error generating PDF:", error);
                if (isMounted) setLoading(false);
            }
        };

        // Debounce slightly to allow UI to settle first
        const timer = setTimeout(() => {
            generatePdf();
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [data]); // Re-run if data changes

    if (!blobUrl && loading) {
        return (
            <Button variant="outline" disabled className="bg-emerald-50 border-emerald-200 text-emerald-700">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyiapkan PDF...
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            asChild
        >
            <a href={blobUrl || "#"} download={`Laporan_${data.santri?.nama?.replace(/\s+/g, "_") || "Santri"}_${data.monthName}_${data.year}.pdf`}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
            </a>
        </Button>
    );
}
