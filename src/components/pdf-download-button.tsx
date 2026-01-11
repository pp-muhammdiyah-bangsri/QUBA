"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface PDFDownloadButtonProps {
    data: any; // Using any to avoid strict type checks during revert
}

export function PDFDownloadButton({ data }: PDFDownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const { pdf } = await import("@react-pdf/renderer");
            const { LaporanPDFDocument } = await import("@/lib/pdf/laporan-template");

            const blob = await pdf(<LaporanPDFDocument data={data} />).toBlob();
            const url = URL.createObjectURL(blob);

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `Laporan_${data.santri?.nama?.replace(/\s+/g, "_") || "Santri"}_${data.monthName}_${data.year}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
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
            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses PDF...
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
