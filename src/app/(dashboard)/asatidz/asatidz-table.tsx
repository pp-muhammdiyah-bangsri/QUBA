"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { createAsatidz, updateAsatidz, deleteAsatidz, AsatidzFormData } from "./actions";
import { PhotoUpload } from "@/components/photo-upload";
import { Textarea } from "@/components/ui/textarea";

interface Asatidz {
    id: string;
    nama: string;
    jenis_kelamin: "L" | "P" | null;
    alamat: string | null;
    kontak: string | null;
    user_id: string | null;
    foto_url: string | null;
    biografi: string | null;
    pendidikan: string | null;
    keahlian: string | null;
    created_at: string;
}

interface AsatidzTableProps {
    initialData: Asatidz[];
}

export function AsatidzTable({ initialData }: AsatidzTableProps) {
    const [data, setData] = useState<Asatidz[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingAsatidz, setEditingAsatidz] = useState<Asatidz | null>(null);
    const [deletingAsatidz, setDeletingAsatidz] = useState<Asatidz | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<AsatidzFormData>({
        nama: "",
        jenis_kelamin: "L",
        alamat: "",
        kontak: "",
        foto_url: "",
        biografi: "",
        pendidikan: "",
        keahlian: "",
    });

    const filteredData = data.filter((asatidz) =>
        asatidz.nama.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingAsatidz(null);
        setFormData({ nama: "", jenis_kelamin: "L", alamat: "", kontak: "", foto_url: "", biografi: "", pendidikan: "", keahlian: "" });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (asatidz: Asatidz) => {
        setEditingAsatidz(asatidz);
        setFormData({
            nama: asatidz.nama,
            jenis_kelamin: asatidz.jenis_kelamin || "L",
            alamat: asatidz.alamat || "",
            kontak: asatidz.kontak || "",
            foto_url: asatidz.foto_url || "",
            biografi: asatidz.biografi || "",
            pendidikan: asatidz.pendidikan || "",
            keahlian: asatidz.keahlian || "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (asatidz: Asatidz) => {
        setDeletingAsatidz(asatidz);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingAsatidz) {
                const result = await updateAsatidz(editingAsatidz.id, formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    setData((prev) =>
                        prev.map((a) =>
                            a.id === editingAsatidz.id ? { ...a, ...formData } : a
                        )
                    );
                    setIsDialogOpen(false);
                }
            } else {
                const result = await createAsatidz(formData);
                if (result.error) {
                    setError(result.error);
                } else {
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
        if (!deletingAsatidz) return;
        setLoading(true);

        try {
            const result = await deleteAsatidz(deletingAsatidz.id);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) => prev.filter((a) => a.id !== deletingAsatidz.id));
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
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari asatidz..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Asatidz
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data asatidz"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((asatidz) => (
                                    <TableRow key={asatidz.id}>
                                        <TableCell className="font-medium">{asatidz.nama}</TableCell>
                                        <TableCell>{asatidz.alamat || "-"}</TableCell>
                                        <TableCell>{asatidz.kontak || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(asatidz)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDelete(asatidz)}
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
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAsatidz ? "Edit Asatidz" : "Tambah Asatidz Baru"}
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
                            <div className="flex justify-center pb-3 border-b border-gray-100 dark:border-gray-800">
                                <PhotoUpload
                                    currentUrl={formData.foto_url || null}
                                    onUpload={(url) => setFormData({ ...formData, foto_url: url || "" })}
                                    folder="asatidz"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Lengkap *</Label>
                                <Input
                                    id="nama"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                                    <Select
                                        id="jenis_kelamin"
                                        value={formData.jenis_kelamin}
                                        onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as "L" | "P" })}
                                    >
                                        <option value="">-- Pilih --</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kontak">Kontak</Label>
                                    <Input
                                        id="kontak"
                                        value={formData.kontak}
                                        onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                    />
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
                            {!editingAsatidz && (
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                        ✓ Akun Ustadz Otomatis
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        Email: <span className="font-mono">ustadz.{(formData.nama || "[nama]").toLowerCase().replace(/\s+/g, "").substring(0, 15)}@quba.app</span><br />
                                        Password: Ustadz_{(formData.nama || "[nama]").toLowerCase().replace(/\s+/g, "").substring(0, 8)}
                                    </p>
                                </div>
                            )}
                            {/* Profil Section for PSB */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Profil Untuk PSB (Opsional)</p>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="biografi">Biografi Singkat</Label>
                                        <Textarea
                                            id="biografi"
                                            value={formData.biografi || ""}
                                            onChange={(e) => setFormData({ ...formData, biografi: e.target.value })}
                                            placeholder="Ceritakan pengalaman dan motivasi mengajar..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pendidikan">Pendidikan</Label>
                                            <Input
                                                id="pendidikan"
                                                value={formData.pendidikan || ""}
                                                onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                                                placeholder="S1 Pendidikan Islam, UIN..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="keahlian">Keahlian/Bidang</Label>
                                            <Input
                                                id="keahlian"
                                                value={formData.keahlian || ""}
                                                onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                                                placeholder="Tahfidz, Tajwid, Fiqih..."
                                            />
                                        </div>
                                    </div>
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
                        <DialogTitle>Hapus Asatidz</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus data{" "}
                        <strong>{deletingAsatidz?.nama}</strong>? Tindakan ini tidak dapat
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