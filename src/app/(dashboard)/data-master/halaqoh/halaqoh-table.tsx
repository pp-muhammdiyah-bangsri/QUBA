"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createHalaqoh, updateHalaqoh, deleteHalaqoh, Halaqoh, HalaqohFormData } from "../actions";

interface AsatidzOption {
    id: string;
    nama: string;
    jenis_kelamin: "L" | "P" | null;
}

interface HalaqohTableProps {
    initialData: Halaqoh[];
    asatidzList: AsatidzOption[];
}

export function HalaqohTable({ initialData, asatidzList }: HalaqohTableProps) {
    const { showToast } = useToast();
    const [data, setData] = useState<Halaqoh[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Halaqoh | null>(null);
    const [deletingItem, setDeletingItem] = useState<Halaqoh | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HalaqohFormData>({
        nama: "",
        musyrif_id: null,
    });

    const filteredData = data.filter(
        (item) => item.nama.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ nama: "", musyrif_id: null });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: Halaqoh) => {
        setEditingItem(item);
        setFormData({
            nama: item.nama,
            musyrif_id: item.musyrif_id,
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Halaqoh) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = editingItem
            ? await updateHalaqoh(editingItem.id, formData)
            : await createHalaqoh(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        showToast("success", editingItem ? "Halaqoh berhasil diperbarui!" : "Halaqoh berhasil ditambahkan!");
        setIsDialogOpen(false);
        setLoading(false);
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setLoading(true);

        const result = await deleteHalaqoh(deletingItem.id);

        if (result.error) {
            showToast("error", result.error);
            setLoading(false);
            return;
        }

        showToast("success", "Halaqoh berhasil dihapus");
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Cari halaqoh..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4" />
                            Tambah Halaqoh
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Halaqoh</TableHead>
                                <TableHead>Musyrif</TableHead>
                                <TableHead className="w-24">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data halaqoh"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama}</TableCell>
                                        <TableCell>
                                            {item.musyrif ? (
                                                <>
                                                    {item.musyrif.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {item.musyrif.nama}
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
                        <DialogTitle>{editingItem ? "Edit Halaqoh" : "Tambah Halaqoh"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Perbarui data halaqoh" : "Tambahkan halaqoh baru"}
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
                                <Label htmlFor="nama">Nama Halaqoh *</Label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Halaqoh Abu Bakar"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="musyrif_id">Musyrif</Label>
                                <SearchableSelect
                                    options={asatidzList.map((a) => ({
                                        value: a.id,
                                        label: `${a.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} ${a.nama}`,
                                    }))}
                                    value={formData.musyrif_id || ""}
                                    onChange={(value) => setFormData({ ...formData, musyrif_id: value || null })}
                                    placeholder="-- Tidak Ada --"
                                    searchPlaceholder="Ketik nama ustadz..."
                                    emptyText="Ustadz tidak ditemukan"
                                />
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
                        <DialogTitle>Hapus Halaqoh?</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus halaqoh quot;{deletingItem?.nama}&quot;?
                            Santri yang tergabung dalam halaqoh ini akan menjadi tidak memiliki halaqoh.
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
