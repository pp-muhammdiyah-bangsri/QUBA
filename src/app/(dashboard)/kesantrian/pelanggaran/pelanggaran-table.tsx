"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, AlertTriangle, CheckCircle } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createPelanggaran, updatePelanggaran, deletePelanggaran, PelanggaranFormData } from "../actions";

interface Pelanggaran {
    id: string;
    santri_id: string;
    deskripsi: string;
    poin: number | null;
    tanggal: string;
    penyelesaian: string | null;
    santri: { id: string; nama: string; nis: string; jenjang: string } | null;
}

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
}

interface PelanggaranTableProps {
    initialData: Pelanggaran[];
    santriList: SantriOption[];
    userRole?: string;
}

export function PelanggaranTable({ initialData, santriList, userRole = "admin" }: PelanggaranTableProps) {
    const [data, setData] = useState<Pelanggaran[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Pelanggaran | null>(null);
    const [deletingItem, setDeletingItem] = useState<Pelanggaran | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PelanggaranFormData>({
        santri_id: "",
        deskripsi: "",
        poin: undefined,
        tanggal: new Date().toISOString().split("T")[0],
        penyelesaian: "",
    });

    const filteredData = data.filter(
        (item) =>
            item.santri?.nama?.toLowerCase().includes(search.toLowerCase()) ||
            item.deskripsi.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            santri_id: "",
            deskripsi: "",
            poin: undefined,
            tanggal: new Date().toISOString().split("T")[0],
            penyelesaian: "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: Pelanggaran) => {
        setEditingItem(item);
        setFormData({
            santri_id: item.santri_id,
            deskripsi: item.deskripsi,
            poin: item.poin || undefined,
            tanggal: item.tanggal,
            penyelesaian: item.penyelesaian || "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Pelanggaran) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingItem) {
                const result = await updatePelanggaran(editingItem.id, formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    window.location.reload();
                }
            } else {
                const result = await createPelanggaran(formData);
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
            const result = await deletePelanggaran(deletingItem.id);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) => prev.filter((s) => s.id !== deletingItem.id));
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Stats
    const totalPoin = data.reduce((sum, p) => sum + (p.poin || 0), 0);
    const selesaiCount = data.filter((p) => p.penyelesaian).length;

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 dark:border dark:border-red-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-800/50">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{data.length}</div>
                                <div className="text-sm text-red-600/80 dark:text-red-400/80">Total Pelanggaran</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40 dark:border dark:border-yellow-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-bold border border-yellow-100 dark:border-yellow-800/50">
                                P
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{totalPoin}</div>
                                <div className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Total Poin</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 dark:border dark:border-green-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-100 dark:border-green-800/50">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{selesaiCount}</div>
                                <div className="text-sm text-green-600/80 dark:text-green-400/80">Sudah Diselesaikan</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        {userRole !== "ortu" ? (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari santri atau pelanggaran..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        ) : <div></div>}
                        <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Pelanggaran
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Poin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data pelanggaran"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{formatDate(item.tanggal)}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.santri?.nama || "-"}</div>
                                                <div className="text-xs text-gray-500">{item.santri?.nis}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[250px]">{item.deskripsi}</TableCell>
                                        <TableCell>
                                            {item.poin ? (
                                                <Badge variant="warning">{item.poin} poin</Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {item.penyelesaian ? (
                                                <Badge variant="success">Selesai</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
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
                                                onClick={() => handleOpenDelete(item)}
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
                            {editingItem ? "Edit Pelanggaran" : "Tambah Pelanggaran"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="santri_id">Santri *</Label>
                                <SearchableSelect
                                    options={santriList.map((s) => ({
                                        value: s.id,
                                        label: s.nama,
                                        sublabel: `NIS: ${s.nis}`,
                                    }))}
                                    value={formData.santri_id}
                                    onChange={(value) => setFormData({ ...formData, santri_id: value })}
                                    placeholder="-- Pilih Santri --"
                                    searchPlaceholder="Ketik nama santri..."
                                    emptyText="Santri tidak ditemukan"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal *</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="poin">Poin</Label>
                                    <Input
                                        id="poin"
                                        type="number"
                                        min="0"
                                        value={formData.poin || ""}
                                        onChange={(e) => setFormData({ ...formData, poin: e.target.value ? parseInt(e.target.value) : undefined })}
                                        placeholder="Opsional"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi Pelanggaran *</Label>
                                <Input
                                    id="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="penyelesaian">Penyelesaian</Label>
                                <Input
                                    id="penyelesaian"
                                    value={formData.penyelesaian || ""}
                                    onChange={(e) => setFormData({ ...formData, penyelesaian: e.target.value })}
                                    placeholder="Kosongkan jika belum diselesaikan"
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

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Pelanggaran</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus data pelanggaran{" "}
                        <strong>{deletingItem?.santri?.nama}</strong>?
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
        </>
    );
}
