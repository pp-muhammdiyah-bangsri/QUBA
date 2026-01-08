"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createKelas, updateKelas, deleteKelas, Kelas, KelasFormData } from "../actions";

interface AsatidzOption {
    id: string;
    nama: string;
    jenis_kelamin: "L" | "P" | null;
}

interface KelasTableProps {
    initialData: Kelas[];
    asatidzList: AsatidzOption[];
}

export function KelasTable({ initialData, asatidzList }: KelasTableProps) {
    const { showToast } = useToast();
    const [data, setData] = useState<Kelas[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Kelas | null>(null);
    const [deletingItem, setDeletingItem] = useState<Kelas | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<KelasFormData>({
        nama: "",
        tingkat: 7,
        wali_kelas_id: null,
    });

    const filteredData = data.filter(
        (item) => item.nama.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ nama: "", tingkat: 7, wali_kelas_id: null });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: Kelas) => {
        setEditingItem(item);
        setFormData({
            nama: item.nama,
            tingkat: item.tingkat,
            wali_kelas_id: item.wali_kelas_id,
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Kelas) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = editingItem
            ? await updateKelas(editingItem.id, formData)
            : await createKelas(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        showToast("success", editingItem ? "Kelas berhasil diperbarui!" : "Kelas berhasil ditambahkan!");
        setIsDialogOpen(false);
        setLoading(false);
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setLoading(true);

        const result = await deleteKelas(deletingItem.id);

        if (result.error) {
            showToast("error", result.error);
            setLoading(false);
            return;
        }

        showToast("success", "Kelas berhasil dihapus");
        setData(data.filter((d) => d.id !== deletingItem.id));
        setIsDeleteDialogOpen(false);
        setDeletingItem(null);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Kelas
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Kelas</TableHead>
                                <TableHead>Tingkat</TableHead>
                                <TableHead>Wali Kelas</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data kelas"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Kelas {item.tingkat}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.wali_kelas ? (
                                                <>
                                                    {item.wali_kelas.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {item.wali_kelas.nama}
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(item)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleOpenDelete(item)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
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
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Perbarui data kelas" : "Tambahkan kelas baru"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Kelas *</Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: 7A, 8 Putra"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tingkat">Tingkat *</Label>
                                <Select
                                    id="tingkat"
                                    value={formData.tingkat.toString()}
                                    onChange={(e) => setFormData({ ...formData, tingkat: parseInt(e.target.value) })}
                                >
                                    {[7, 8, 9, 10, 11, 12].map((t) => (
                                        <option key={t} value={t}>Kelas {t}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wali_kelas_id">Wali Kelas</Label>
                                <Select
                                    id="wali_kelas_id"
                                    value={formData.wali_kelas_id || ""}
                                    onChange={(e) => setFormData({ ...formData, wali_kelas_id: e.target.value || null })}
                                >
                                    <option value="">-- Tidak Ada --</option>
                                    {asatidzList.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {a.nama}
                                        </option>
                                    ))}
                                </Select>
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
                        <DialogTitle>Hapus Kelas?</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus kelas &quot;{deletingItem?.nama}&quot;?
                            Santri yang tergabung dalam kelas ini akan menjadi tidak memiliki kelas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
