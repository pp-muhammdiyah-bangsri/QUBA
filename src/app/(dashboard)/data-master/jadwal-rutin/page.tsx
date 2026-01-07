"use client";

import { useEffect, useState } from "react";
import { getJadwalRutin, createJadwalRutin, deleteJadwalRutin, JadwalRutin } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";

const HARI_LABELS = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];

export default function JadwalRutinPage() {
    const [jadwalList, setJadwalList] = useState<JadwalRutin[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [namaKegiatan, setNamaKegiatan] = useState("");
    const [jamMulai, setJamMulai] = useState("");
    const [jamSelesai, setJamSelesai] = useState("");
    const [kodePresensi, setKodePresensi] = useState("");
    const [hariAktif, setHariAktif] = useState<number[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const data = await getJadwalRutin();
        setJadwalList(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleHari = (day: number) => {
        setHariAktif((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hariAktif.length === 0) {
            alert("Pilih minimal satu hari aktif!");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.set("nama_kegiatan", namaKegiatan);
        formData.set("jam_mulai", jamMulai);
        formData.set("jam_selesai", jamSelesai);
        formData.set("kode_presensi", kodePresensi);
        formData.set("hari_aktif", hariAktif.join(","));

        await createJadwalRutin(formData);

        // Reset form
        setNamaKegiatan("");
        setJamMulai("");
        setJamSelesai("");
        setKodePresensi("");
        setHariAktif([]);

        // Refresh list
        await fetchData();
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin hapus jadwal ini?")) return;
        await deleteJadwalRutin(id);
        await fetchData();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Manajemen Jadwal Rutin</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Input */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Tambah Jadwal Baru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_kegiatan">Nama Kegiatan</Label>
                                <Input
                                    id="nama_kegiatan"
                                    value={namaKegiatan}
                                    onChange={(e) => setNamaKegiatan(e.target.value)}
                                    placeholder="Contoh: KBM Pagi"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="jam_mulai">Mulai</Label>
                                    <Input
                                        id="jam_mulai"
                                        type="time"
                                        value={jamMulai}
                                        onChange={(e) => setJamMulai(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jam_selesai">Selesai</Label>
                                    <Input
                                        id="jam_selesai"
                                        type="time"
                                        value={jamSelesai}
                                        onChange={(e) => setJamSelesai(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kode_presensi">Kode Unik (Slug)</Label>
                                <Input
                                    id="kode_presensi"
                                    value={kodePresensi}
                                    onChange={(e) => setKodePresensi(e.target.value)}
                                    placeholder="kbm-pagi"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hari Aktif</Label>
                                <div className="flex flex-wrap gap-2">
                                    {HARI_LABELS.map((d, i) => (
                                        <label
                                            key={i}
                                            className={`flex items-center gap-1 text-sm border p-2 rounded cursor-pointer transition-colors ${hariAktif.includes(i + 1)
                                                    ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                                                    : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={hariAktif.includes(i + 1)}
                                                onChange={() => handleToggleHari(i + 1)}
                                                className="sr-only"
                                            />
                                            {d}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Simpan Jadwal
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List Jadwal */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daftar Jadwal Rutin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kegiatan</TableHead>
                                        <TableHead>Jam</TableHead>
                                        <TableHead>Hari</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jadwalList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                                                Belum ada jadwal rutin
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        jadwalList.map((j) => (
                                            <TableRow key={j.id}>
                                                <TableCell>
                                                    <div className="font-medium">{j.nama_kegiatan}</div>
                                                    <div className="text-xs text-gray-500">{j.kode_presensi}</div>
                                                </TableCell>
                                                <TableCell>{j.jam_mulai} - {j.jam_selesai}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {j.hari_aktif.map((d) => (
                                                            <Badge key={d} variant="outline" className="text-xs">
                                                                {HARI_LABELS[d - 1]}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500"
                                                        onClick={() => handleDelete(j.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
