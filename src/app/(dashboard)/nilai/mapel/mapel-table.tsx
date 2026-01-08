"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, BookOpen, Calculator } from "lucide-react";
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
import { createMapel, updateMapel, deleteMapel, MapelFormData } from "../actions";

interface Mapel {
    id: string;
    nama: string;
    kategori: "diniyah" | "umum";
    kkm: number;
}

interface MapelTableProps {
    initialData: Mapel[];
}

const kategoriColors: Record<string, string> = {
    diniyah: "bg-green-100 text-green-800",
    umum: "bg-blue-100 text-blue-800",
};

export function MapelTable({ initialData }: MapelTableProps) {
    const [data, setData] = useState<Mapel[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Mapel | null>(null);
    const [deletingItem, setDeletingItem] = useState<Mapel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<MapelFormData>({
        nama: "",
        kategori: "diniyah",
        kkm: 70,
    });

    const filteredData = data.filter(
        (item) => item.nama.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({ nama: "", kategori: "diniyah", kkm: 70 });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: Mapel) => {
        setEditingItem(item);
        setFormData({ nama: item.nama, kategori: item.kategori, kkm: item.kkm });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Mapel) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingItem) {
                const result = await updateMapel(editingItem.id, formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    window.location.reload();
                }
            } else {
                const result = await createMapel(formData);
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
        if (!deletingItem) return;
        setLoading(true);

        try {
            const result = await deleteMapel(deletingItem.id);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) => prev.filter((m) => m.id !== deletingItem.id));
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = {
        diniyah: data.filter((m) => m.kategori === "diniyah").length,
        umum: data.filter((m) => m.kategori === "umum").length,
        avgKkm: data.length > 0 ? Math.round(data.reduce((sum, m) => sum + m.kkm, 0) / data.length) : 0,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-700">{stats.diniyah}</div>
                                <div className="text-sm text-green-600">Mapel Diniyah</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-700">{stats.umum}</div>
                                <div className="text-sm text-blue-600">Mapel Umum</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-700">{stats.avgKkm}</div>
                                <div className="text-sm text-purple-600">Rata-rata KKM</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari mata pelajaran..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Mapel
                        </Button>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Mata Pelajaran</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>KKM</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            Tidak ada data mapel
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={kategoriColors[item.kategori]}>
                                                    {item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">{item.kkm}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(item)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Mapel" : "Tambah Mapel Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
                        )}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Mapel *</Label>
                                <Input
                                    id="nama"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Fiqih, Matematika"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="kategori">Kategori *</Label>
                                    <Select
                                        id="kategori"
                                        value={formData.kategori}
                                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value as "diniyah" | "umum" })}
                                    >
                                        <option value="diniyah">Diniyah</option>
                                        <option value="umum">Umum</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kkm">KKM *</Label>
                                    <Input
                                        id="kkm"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.kkm}
                                        onChange={(e) => setFormData({ ...formData, kkm: parseInt(e.target.value) || 0 })}
                                        required
                                    />
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

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Mapel</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus <strong>{deletingItem?.nama}</strong>?
                    </p>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
