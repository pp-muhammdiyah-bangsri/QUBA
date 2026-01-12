"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Download, Check, X, Loader2, AlertCircle } from "lucide-react";
import { bulkImportSantri, ImportedSantri, ImportResult } from "./actions";
import Link from "next/link";

export default function ImportSantriPage() {
    const [previewData, setPreviewData] = useState<ImportedSantri[]>([]);
    const [importResults, setImportResults] = useState<ImportResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"upload" | "preview" | "result">("upload");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            // Map Excel columns to our format
            const mapped: ImportedSantri[] = jsonData.map((row: any) => ({
                nis: String(row["NIS"] || row["nis"] || "").trim(),
                nama: String(row["Nama"] || row["nama"] || row["Nama Lengkap"] || "").trim(),
                jenis_kelamin: (String(row["JK"] || row["Jenis Kelamin"] || row["jenis_kelamin"] || "L").toUpperCase().charAt(0) === "P" ? "P" : "L") as "L" | "P",
                jenjang: (() => {
                    const val = String(row["Jenjang"] || row["jenjang"] || "SMP").toUpperCase();
                    if (val.includes("SMK")) return "SMK";
                    if (val.includes("SMA")) return "SMA";
                    return "SMP";
                })() as "SMP" | "SMA" | "SMK",
                alamat: String(row["Alamat"] || row["alamat"] || ""),
                nama_wali: String(row["Nama Wali"] || row["nama_wali"] || row["Wali"] || ""),
                kontak_wali: String(row["Kontak Wali"] || row["kontak_wali"] || row["HP Wali"] || ""),
            }));

            setPreviewData(mapped);
            setStep("preview");
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
        },
        maxFiles: 1,
    });

    const handleImport = async () => {
        setLoading(true);
        const results = await bulkImportSantri(previewData);
        setImportResults(results);
        setStep("result");
        setLoading(false);
    };

    const handleReset = () => {
        setPreviewData([]);
        setImportResults([]);
        setStep("upload");
    };

    const successCount = importResults.filter((r) => r.success).length;
    const failCount = importResults.filter((r) => !r.success).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Import Data Santri</h1>
                    <p className="text-gray-500">Upload file Excel untuk memasukkan data santri secara massal</p>
                </div>
                <Button variant="outline" onClick={() => {
                    const templateData = [
                        { NIS: "2024001", Nama: "Ahmad Fauzi", JK: "L", Jenjang: "SMP", Alamat: "Jl. Merdeka No. 1", "Nama Wali": "Bapak Fauzi", "Kontak Wali": "081234567890" },
                        { NIS: "2024002", Nama: "Aisyah Putri", JK: "P", Jenjang: "SMP", Alamat: "Jl. Pahlawan No. 2", "Nama Wali": "Ibu Siti", "Kontak Wali": "081234567891" },
                        { NIS: "2024003", Nama: "Muhammad Rizki", JK: "L", Jenjang: "SMA", Alamat: "Jl. Sudirman No. 3", "Nama Wali": "Bapak Rizki", "Kontak Wali": "081234567892" },
                    ];
                    const worksheet = XLSX.utils.json_to_sheet(templateData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Santri");
                    XLSX.writeFile(workbook, "template_santri.xlsx");
                }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                </Button>
            </div>

            {step === "upload" && (
                <Card>
                    <CardContent className="p-8">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            {isDragActive ? (
                                <p className="text-emerald-600 font-medium">Drop file Excel di sini...</p>
                            ) : (
                                <>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                                        Drag & drop file Excel, atau klik untuk memilih
                                    </p>
                                    <p className="text-sm text-gray-400">Format: .xlsx atau .xls</p>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "preview" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5" />
                            Preview Data ({previewData.length} baris)
                        </CardTitle>
                        <CardDescription>
                            Periksa data sebelum mengimport. Pastikan format sudah benar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto border rounded-lg mb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>JK</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead>Alamat</TableHead>
                                        <TableHead>Nama Wali</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.slice(0, 50).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell className="font-mono">{row.nis || <span className="text-red-500">-</span>}</TableCell>
                                            <TableCell>{row.nama || <span className="text-red-500">-</span>}</TableCell>
                                            <TableCell>{row.jenis_kelamin}</TableCell>
                                            <TableCell>
                                                <Badge variant={row.jenjang === "SMP" ? "secondary" : "default"}>
                                                    {row.jenjang}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-32 truncate">{row.alamat}</TableCell>
                                            <TableCell>{row.nama_wali}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {previewData.length > 50 && (
                            <p className="text-sm text-gray-500 mb-4">
                                Menampilkan 50 dari {previewData.length} baris
                            </p>
                        )}
                        <div className="flex gap-3">
                            <Button onClick={handleReset} variant="outline">
                                Batal
                            </Button>
                            <Button onClick={handleImport} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import {previewData.length} Data
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "result" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hasil Import</CardTitle>
                        <CardDescription>
                            <span className="text-green-600 font-medium">{successCount} berhasil</span>
                            {failCount > 0 && (
                                <span className="text-red-600 font-medium ml-3">{failCount} gagal</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto border rounded-lg mb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Baris</TableHead>
                                        <TableHead>NIS</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importResults.map((result, i) => (
                                        <TableRow key={i} className={result.success ? "" : "bg-red-50"}>
                                            <TableCell>
                                                {result.success ? (
                                                    <Check className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-600" />
                                                )}
                                            </TableCell>
                                            <TableCell>{result.row}</TableCell>
                                            <TableCell className="font-mono">{result.nis}</TableCell>
                                            <TableCell>{result.nama}</TableCell>
                                            <TableCell>
                                                {result.success ? (
                                                    <span className="text-green-600">Berhasil</span>
                                                ) : (
                                                    <span className="text-red-600">{result.error}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleReset} variant="outline">
                                Import Lagi
                            </Button>
                            <Link href="/santri">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    Lihat Data Santri
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
