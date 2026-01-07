"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSantri, updateSantri, deleteSantri, SantriFormData } from "./actions";
import { PhotoUpload } from "@/components/photo-upload";

interface Santri {
    id: string;
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    alamat: string | null;
    nama_wali: string | null;
    kontak_wali: string | null;
    jenjang: "SMP" | "SMA" | "SMK";
    status: string;
    foto_url: string | null;
    kelas_id: string | null;
    halaqoh_id: string | null;
    kelas?: { id: string; nama: string } | null;
    halaqoh?: { id: string; nama: string } | null;
    created_at: string;
}

interface KelasOption {
    id: string;
    nama: string;
    tingkat: number;
}

interface HalaqohOption {
    id: string;
    nama: string;
}

interface SantriTableProps {
    initialData: Santri[];
    kelasList: KelasOption[];
    halaqohList: HalaqohOption[];
}

export function SantriTable({ initialData, kelasList, halaqohList }: SantriTableProps) {
    const [data, setData] = useState<Santri[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
    const [deletingSantri, setDeletingSantri] = useState<Santri | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<SantriFormData>({
        nis: "",
        nama: "",
        jenis_kelamin: "L",
        alamat: "",
        nama_wali: "",
        kontak_wali: "",

        jenjang: "SMP",
        status: "aktif",
        foto_url: "",
        kelas_id: null,
        halaqoh_id: null,
    });

    const filteredData = data.filter(
        (santri) =>
            santri.nama.toLowerCase().includes(search.toLowerCase()) ||
            santri.nis.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingSantri(null);
        setFormData({
            nis: "",
            nama: "",
            jenis_kelamin: "L",
            alamat: "",
            nama_wali: "",
            kontak_wali: "",

            jenjang: "SMP",
            status: "aktif",
            foto_url: "",
            kelas_id: null,
            halaqoh_id: null,
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (santri: Santri) => {
        setEditingSantri(santri);
        setFormData({
            nis: santri.nis,
            nama: santri.nama,
            jenis_kelamin: santri.jenis_kelamin,
            alamat: santri.alamat || "",
            nama_wali: santri.nama_wali || "",
            kontak_wali: santri.kontak_wali || "",

            jenjang: santri.jenjang,
            status: santri.status,
            foto_url: santri.foto_url || "",
            kelas_id: santri.kelas_id || null,
            halaqoh_id: santri.halaqoh_id || null,
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (santri: Santri) => {
        setDeletingSantri(santri);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingSantri) {
                const result = await updateSantri(editingSantri.id, formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    setData((prev) =>
                        prev.map((s) =>
                            s.id === editingSantri.id ? { ...s, ...formData } : s
                        )
                    );
                    setIsDialogOpen(false);
                }
            } else {
                const result = await createSantri(formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    // Show auth result if email was provided
                    if (result.authResult) {
                        if (result.authResult.success) {
                            alert(`Santri berhasil ditambahkan!\n\nAkun Wali dibuat:\nEmail: ${result.authResult.email}\nPassword: ${result.authResult.password}`);
                        } else {
                            alert(`Santri berhasil ditambahkan, tapi pembuatan akun wali gagal:\n${result.authResult.error}`);
                        }
                    }
                    // Refresh the page to get new data with ID
                    window.location.reload();
                }
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingSantri) return;
        setLoading(true);

        try {
            const result = await deleteSantri(deletingSantri.id);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) => prev.filter((s) => s.id !== deletingSantri.id));
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari santri..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleOpenAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Santri
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NIS</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>L/P</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead>Wali</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data santri"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((santri) => (
                                    <TableRow key={santri.id}>
                                        <TableCell className="font-medium">{santri.nis}</TableCell>
                                        <TableCell>{santri.nama}</TableCell>
                                        <TableCell>{santri.jenis_kelamin}</TableCell>
                                        <TableCell>
                                            <Badge variant={santri.jenjang === "SMP" ? "secondary" : "default"}>
                                                {santri.jenjang}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{santri.nama_wali || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant={santri.status === "aktif" ? "success" : "warning"}>
                                                {santri.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(santri)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDelete(santri)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSantri ? "Edit Santri" : "Tambah Santri Baru"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-4 py-4">
                            {/* Photo Upload Section */}
                            <div className="flex justify-center pb-2 border-b border-gray-100 dark:border-gray-800">
                                <PhotoUpload
                                    currentUrl={formData.foto_url || null}
                                    onUpload={(url) => setFormData({ ...formData, foto_url: url || "" })}
                                    folder="santri"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nis">NIS *</Label>
                                    <Input
                                        id="nis"
                                        value={formData.nis}
                                        onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jenjang">Jenjang *</Label>
                                    <Select
                                        id="jenjang"
                                        value={formData.jenjang}
                                        onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as "SMP" | "SMA" | "SMK" })}
                                    >
                                        <option value="SMP">SMP</option>
                                        <option value="SMA">SMA</option>
                                        <option value="SMK">SMK</option>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama">Nama Lengkap *</Label>
                                    <Input
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                                    <Select
                                        id="jenis_kelamin"
                                        value={formData.jenis_kelamin}
                                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as "L" | "P" })}
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input
                                    id="alamat"
                                    value={formData.alamat}
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama_wali">Nama Wali</Label>
                                    <Input
                                        id="nama_wali"
                                        value={formData.nama_wali}
                                        onChange={(e) => setFormData({ ...formData, nama_wali: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kontak_wali">Kontak Wali</Label>
                                    <Input
                                        id="kontak_wali"
                                        value={formData.kontak_wali}
                                        onChange={(e) => setFormData({ ...formData, kontak_wali: e.target.value })}
                                    />
                                </div>
                            </div>
                            {!editingSantri && (
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                        ✓ Akun Orang Tua Otomatis
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        Email: <span className="font-mono">{formData.nis || "[NIS]"}@quba.app</span><br />
                                        Password: Nomor HP Wali (atau Ortu123456)
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="alumni">Alumni</option>
                                    <option value="pindah">Pindah</option>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kelas_id">Kelas</Label>
                                    <Select
                                        id="kelas_id"
                                        value={formData.kelas_id || ""}
                                        onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value || null })}
                                    >
                                        <option value="">-- Belum Ditetapkan --</option>
                                        {kelasList.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="halaqoh_id">Halaqoh</Label>
                                    <Select
                                        id="halaqoh_id"
                                        value={formData.halaqoh_id || ""}
                                        onChange={(e) => setFormData({ ...formData, halaqoh_id: e.target.value || null })}
                                    >
                                        <option value="">-- Belum Ditetapkan --</option>
                                        {halaqohList.map((h) => (
                                            <option key={h.id} value={h.id}>{h.nama}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Santri</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus data santri{" "}
                        <strong>{deletingSantri?.nama}</strong>? Tindakan ini tidak dapat
                        dibatalkan.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}