"use client";

import { useState, useCallback } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { bulkImportSantri } from "./actions";

interface ParsedRow {
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    alamat?: string;
    nama_wali?: string;
    kontak_wali?: string;
    jenjang: "SMP" | "SMA";
    status?: string;
}

interface ImportResult {
    success: boolean;
    row: number;
    nis: string;
    nama: string;
    error?: string;
}

export function ImportSantri() {
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [importResults, setImportResults] = useState<ImportResult[] | null>(null);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setImportResults(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n").filter((line) => line.trim());

            if (lines.length < 2) {
                return;
            }

            const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
            const data: ParsedRow[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
                const row: Record<string, string> = {};
                headers.forEach((h, idx) => {
                    row[h] = values[idx] || "";
                });

                data.push({
                    nis: row.nis || "",
                    nama: row.nama || "",
                    jenis_kelamin: (row.jenis_kelamin?.toUpperCase() === "P" ? "P" : "L") as "L" | "P",
                    alamat: row.alamat || undefined,
                    nama_wali: row.nama_wali || undefined,
                    kontak_wali: row.kontak_wali || undefined,
                    jenjang: (row.jenjang?.toUpperCase() === "SMA" ? "SMA" : "SMP") as "SMP" | "SMA",
                    status: row.status || "aktif",
                });
            }

            setParsedData(data);
        };
        reader.readAsText(file);
    }, []);

    const handleImport = async () => {
        if (parsedData.length === 0) return;
        setLoading(true);
        setImportResults(null);

        try {
            const results = await bulkImportSantri(parsedData);
            setImportResults(results);
            const successCount = results.filter(r => r.success).length;
            if (successCount === parsedData.length) {
                setParsedData([]);
                setFileName("");
            }
        } catch {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    const successCount = importResults?.filter(r => r.success).length || 0;
    const failCount = importResults?.filter(r => !r.success).length || 0;

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        Panduan Import
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Format File</h4>
                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                <li>File CSV dengan header di baris pertama</li>
                                <li>Kolom wajib: <code className="bg-gray-100 px-1 rounded">nis, nama, jenis_kelamin, jenjang</code></li>
                                <li>jenis_kelamin: L (Laki-laki) atau P (Perempuan)</li>
                                <li>jenjang: SMP atau SMA</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium">Kolom Opsional</h4>
                            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                <li><code className="bg-gray-100 px-1 rounded">alamat</code> - Alamat santri</li>
                                <li><code className="bg-gray-100 px-1 rounded">nama_wali</code> - Nama wali/orang tua</li>
                                <li><code className="bg-gray-100 px-1 rounded">kontak_wali</code> - Nomor telepon wali</li>
                                <li><code className="bg-gray-100 px-1 rounded">status</code> - Status (default: aktif)</li>
                            </ul>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => {
                        const csvContent = `nis,nama,jenis_kelamin,jenjang,alamat,nama_wali,kontak_wali
2024001,Ahmad Fauzi,L,SMP,Jl. Merdeka No. 1,Bapak Fauzi,081234567890
2024002,Aisyah Putri,P,SMP,Jl. Pahlawan No. 2,Ibu Siti,081234567891
2024003,Muhammad Rizki,L,SMA,Jl. Sudirman No. 3,Bapak Rizki,081234567892`;
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = "template_santri.csv";
                        link.click();
                        URL.revokeObjectURL(link.href);
                    }}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Template CSV
                    </Button>
                </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                            </p>
                            <p className="text-xs text-gray-500">File CSV</p>
                        </div>
                        <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    </label>
                    {fileName && (
                        <div className="mt-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">{fileName}</span>
                            <Badge variant="secondary">{parsedData.length} baris</Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Result Messages */}
            {importResults && (
                <Card className={`border-0 shadow-md ${failCount === 0 ? "bg-green-50" : "bg-yellow-50"}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            {failCount === 0 ? (
                                <>
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-700">Import Berhasil!</p>
                                        <p className="text-sm text-green-600">{successCount} data santri berhasil diimport</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    <div>
                                        <p className="font-medium text-yellow-700">Import Selesai dengan Catatan</p>
                                        <p className="text-sm text-yellow-600">{successCount} berhasil, {failCount} gagal</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {failCount > 0 && (
                            <div className="mt-4 max-h-40 overflow-auto">
                                <ul className="text-sm text-red-600 space-y-1">
                                    {importResults.filter(r => !r.success).map((r, i) => (
                                        <li key={i}>Baris {r.row} ({r.nis}): {r.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && (
                <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TableIcon className="w-5 h-5" />
                            Preview Data ({parsedData.length} baris)
                        </CardTitle>
                        <Button onClick={handleImport} disabled={loading}>
                            {loading ? "Mengimport..." : "Import Data"}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>JK</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead>Wali</TableHead>
                                        <TableHead>Kontak</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.slice(0, 50).map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="font-mono">{row.nis}</TableCell>
                                            <TableCell className="font-medium">{row.nama}</TableCell>
                                            <TableCell>
                                                <Badge variant={row.jenis_kelamin === "L" ? "default" : "secondary"}>
                                                    {row.jenis_kelamin}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={row.jenjang === "SMP" ? "secondary" : "default"}>
                                                    {row.jenjang}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{row.nama_wali || "-"}</TableCell>
                                            <TableCell>{row.kontak_wali || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {parsedData.length > 50 && (
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                Menampilkan 50 dari {parsedData.length} baris
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
