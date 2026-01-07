"use client";

import { useState } from "react";
import { FileText, Download, User, BookOpen, Award, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getRapotData } from "../actions";

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
}

interface RapotViewerProps {
    santriList: SantriOption[];
    semesterOptions: string[];
}

interface RapotData {
    santri: {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        jenis_kelamin: string;
        alamat: string;
    } | null;
    semester: string;
    nilaiList: {
        id: string;
        mapel: { nama: string; kategori: string; kkm: number } | null;
        nilai_uh: number | null;
        nilai_uts: number | null;
        nilai_uas: number | null;
        nilai_akhir: number | null;
        catatan: string | null;
    }[];
    hafalan: {
        juzSelesai: number;
        tasmiList: { juz: number; predikat: string; nilai: number | null }[];
    };
    presensi: {
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
    };
    pelanggaranCount: number;
}

export function RapotViewer({ santriList, semesterOptions }: RapotViewerProps) {
    const [selectedSantri, setSelectedSantri] = useState("");
    const [selectedSemester, setSelectedSemester] = useState(semesterOptions[0] || "");
    const [rapotData, setRapotData] = useState<RapotData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLoadRapot = async () => {
        if (!selectedSantri || !selectedSemester) return;
        setLoading(true);
        try {
            const data = await getRapotData(selectedSantri, selectedSemester);
            setRapotData(data);
        } catch (err) {
            console.error("Error loading rapot:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const diniyahNilai = rapotData?.nilaiList.filter((n) => n.mapel?.kategori === "diniyah") || [];
    const umumNilai = rapotData?.nilaiList.filter((n) => n.mapel?.kategori === "umum") || [];

    const totalPresensi = rapotData ? 
        rapotData.presensi.hadir + rapotData.presensi.izin + rapotData.presensi.sakit + rapotData.presensi.alpa : 0;

    return (
        <div className="space-y-6">
            {/* Selection Controls */}
            <Card className="border-0 shadow-md print:hidden">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Pilih Santri</Label>
                            <Select
                                value={selectedSantri}
                                onChange={(e) => setSelectedSantri(e.target.value)}
                            >
                                <option value="">-- Pilih Santri --</option>
                                {santriList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nama} ({s.nis})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                {semesterOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handleLoadRapot} disabled={loading || !selectedSantri}>
                            {loading ? "Memuat..." : "Tampilkan Rapot"}
                        </Button>
                        {rapotData && (
                            <Button variant="outline" onClick={handlePrint}>
                                <Download className="w-4 h-4 mr-2" />
                                Cetak
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Rapot Content */}
            {rapotData && (
                <div className="space-y-6 print:space-y-4" id="rapot-content">
                    {/* Header */}
                    <Card className="border-0 shadow-md print:shadow-none print:border">
                        <CardContent className="p-6">
                            <div className="text-center mb-6 print:mb-4">
                                <h2 className="text-2xl font-bold print:text-xl">LAPORAN HASIL BELAJAR</h2>
                                <p className="text-gray-600">Semester: {rapotData.semester}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="w-32 text-gray-500">Nama</span>
                                        <span className="font-medium">: {rapotData.santri?.nama}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 text-gray-500">NIS</span>
                                        <span className="font-medium">: {rapotData.santri?.nis}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="w-32 text-gray-500">Jenjang</span>
                                        <span className="font-medium">: {rapotData.santri?.jenjang}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 text-gray-500">Jenis Kelamin</span>
                                        <span className="font-medium">: {rapotData.santri?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                        <Card className="border-0 shadow-sm bg-emerald-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <Award className="w-8 h-8 text-emerald-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-emerald-700 print:text-lg">{rapotData.hafalan.juzSelesai}</div>
                                        <div className="text-xs text-emerald-600">Juz Selesai</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-blue-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-8 h-8 text-blue-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-blue-700 print:text-lg">{rapotData.presensi.hadir}/{totalPresensi}</div>
                                        <div className="text-xs text-blue-600">Kehadiran</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-purple-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-8 h-8 text-purple-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-purple-700 print:text-lg">{rapotData.nilaiList.length}</div>
                                        <div className="text-xs text-purple-600">Mapel Dinilai</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm bg-red-50 print:shadow-none print:border">
                            <CardContent className="p-4 print:p-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-8 h-8 text-red-600 print:w-6 print:h-6" />
                                    <div>
                                        <div className="text-xl font-bold text-red-700 print:text-lg">{rapotData.pelanggaranCount}</div>
                                        <div className="text-xs text-red-600">Pelanggaran</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Nilai Diniyah */}
                    <Card className="border-0 shadow-md print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg print:text-base">Nilai Mata Pelajaran Diniyah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="text-center">KKM</TableHead>
                                        <TableHead className="text-center">Nilai</TableHead>
                                        <TableHead className="text-center">Ket</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {diniyahNilai.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500">
                                                Belum ada nilai
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        diniyahNilai.map((n, idx) => (
                                            <TableRow key={n.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{n.mapel?.nama}</TableCell>
                                                <TableCell className="text-center">{n.mapel?.kkm}</TableCell>
                                                <TableCell className="text-center font-bold">{n.nilai_akhir ?? "-"}</TableCell>
                                                <TableCell className="text-center">
                                                    {n.nilai_akhir !== null && n.mapel && (
                                                        <Badge variant={n.nilai_akhir >= n.mapel.kkm ? "success" : "destructive"}>
                                                            {n.nilai_akhir >= n.mapel.kkm ? "T" : "BT"}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Nilai Umum */}
                    <Card className="border-0 shadow-md print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg print:text-base">Nilai Mata Pelajaran Umum</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="text-center">KKM</TableHead>
                                        <TableHead className="text-center">Nilai</TableHead>
                                        <TableHead className="text-center">Ket</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {umumNilai.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500">
                                                Belum ada nilai
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        umumNilai.map((n, idx) => (
                                            <TableRow key={n.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{n.mapel?.nama}</TableCell>
                                                <TableCell className="text-center">{n.mapel?.kkm}</TableCell>
                                                <TableCell className="text-center font-bold">{n.nilai_akhir ?? "-"}</TableCell>
                                                <TableCell className="text-center">
                                                    {n.nilai_akhir !== null && n.mapel && (
                                                        <Badge variant={n.nilai_akhir >= n.mapel.kkm ? "success" : "destructive"}>
                                                            {n.nilai_akhir >= n.mapel.kkm ? "T" : "BT"}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Presensi Summary */}
                    <Card className="border-0 shadow-md print:shadow-none print:border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg print:text-base">Rekap Kehadiran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-green-700 print:text-lg">{rapotData.presensi.hadir}</div>
                                    <div className="text-sm text-green-600">Hadir</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-blue-700 print:text-lg">{rapotData.presensi.izin}</div>
                                    <div className="text-sm text-blue-600">Izin</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-yellow-700 print:text-lg">{rapotData.presensi.sakit}</div>
                                    <div className="text-sm text-yellow-600">Sakit</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg print:p-2">
                                    <div className="text-2xl font-bold text-red-700 print:text-lg">{rapotData.presensi.alpa}</div>
                                    <div className="text-sm text-red-600">Alpa</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Empty State */}
            {!rapotData && !loading && (
                <Card className="border-0 shadow-md print:hidden">
                    <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Pilih santri dan semester untuk melihat rapot</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
