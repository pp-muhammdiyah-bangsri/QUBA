"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcelExportButtonProps<T> {
    data: T[];
    columns: { header: string; key: keyof T }[];
    filename: string;
    sheetName?: string;
}

export function ExcelExportButton<T extends Record<string, unknown>>({
    data,
    columns,
    filename,
    sheetName = "Data",
}: ExcelExportButtonProps<T>) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (data.length === 0) {
            alert("Tidak ada data untuk diekspor");
            return;
        }

        setLoading(true);
        try {
            // Dynamic import to reduce bundle size
            const XLSX = await import("xlsx");

            // Prepare data for export
            const exportData = data.map((row) => {
                const obj: Record<string, unknown> = {};
                columns.forEach((col) => {
                    obj[col.header] = row[col.key];
                });
                return obj;
            });

            // Create worksheet and workbook
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Auto-size columns
            const maxWidths = columns.map((col) => {
                const headerLength = col.header.length;
                const maxDataLength = Math.max(
                    ...data.map((row) => String(row[col.key] || "").length)
                );
                return Math.min(Math.max(headerLength, maxDataLength) + 2, 50);
            });

            worksheet["!cols"] = maxWidths.map((w) => ({ wch: w }));

            // Generate and download
            XLSX.writeFile(workbook, `${filename}.xlsx`);
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
            disabled={loading || data.length === 0}
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
