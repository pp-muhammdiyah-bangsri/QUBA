"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPendaftarPSB, updateStatusPendaftar, deletePendaftar } from "@/app/(auth)/psb/actions";
import { FileSpreadsheet, Search, Trash2, Users, RefreshCcw, Filter } from "lucide-react";
import * as XLSX from "xlsx";

interface Pendaftar {
    id: string;
    no_registrasi: string;
    nama: string;
    nisn?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin: string;
    jenjang?: string;
    program: string;
    asal_sekolah?: string;
    alamat?: string;
    nama_ayah?: string;
    nama_ibu?: string;
    pekerjaan_ayah?: string;
    pekerjaan_ibu?: string;
    telepon_wali?: string;
    email_wali?: string;
    status: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    "Menunggu": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    "Tes": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    "Lulus": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    "Tidak Lulus": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    "Daftar Ulang": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
};

const statusOptions = ["Menunggu", "Tes", "Lulus", "Tidak Lulus", "Daftar Ulang"];

export default function PendaftarPSBPage() {
    const [data, setData] = useState<Pendaftar[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const result = await getPendaftarPSB(filterStatus);
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        const result = await updateStatusPendaftar(id, newStatus);
        if (result.success) {
            setData(prev => prev.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data pendaftar ini?")) return;
        const result = await deletePendaftar(id);
        if (result.success) {
            setData(prev => prev.filter(item => item.id !== id));
        }
    };

    const exportToExcel = () => {
        const exportData = filteredData.map(item => ({
            "No Registrasi": item.no_registrasi,
            "Nama": item.nama,
            "NISN": item.nisn || "-",
            "Tempat Lahir": item.tempat_lahir || "-",
            "Tanggal Lahir": item.tanggal_lahir || "-",
            "Jenis Kelamin": item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
            "Program": item.program,
            "Jenjang": item.jenjang || "-",
            "Asal Sekolah": item.asal_sekolah || "-",
            "Alamat": item.alamat || "-",
            "Nama Ayah": item.nama_ayah || "-",
            "Nama Ibu": item.nama_ibu || "-",
            "Pekerjaan Ayah": item.pekerjaan_ayah || "-",
            "Pekerjaan Ibu": item.pekerjaan_ibu || "-",
            "Telepon Wali": item.telepon_wali || "-",
            "Email Wali": item.email_wali || "-",
            "Status": item.status,
            "Tanggal Daftar": new Date(item.created_at).toLocaleDateString("id-ID"),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftar PSB");
        XLSX.writeFile(workbook, `Pendaftar_PSB_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.no_registrasi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-7 h-7 text-emerald-600" />
                        Pendaftar PSB
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Kelola data calon santri baru
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm">
                        <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
                    </Button>
                </div>
            </div>

            <Card className="border-0 shadow-md dark:bg-zinc-800">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Cari nama atau nomor registrasi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-[180px]"
                            >
                                <option value="all">Semua Status</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Memuat data...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Belum ada data pendaftar
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No. Registrasi</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Telepon Wali</TableHead>
                                        <TableHead>Tanggal Daftar</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm">{item.no_registrasi}</TableCell>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell>
                                                <Badge variant="success">
                                                    {item.program}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.telepon_wali || "-"}</TableCell>
                                            <TableCell>{new Date(item.created_at).toLocaleDateString("id-ID")}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                    className={`w-[140px] h-9 text-xs font-medium ${statusColors[item.status] || ""}`}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="mt-4 text-sm text-gray-500">
                        Total: {filteredData.length} pendaftar
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
