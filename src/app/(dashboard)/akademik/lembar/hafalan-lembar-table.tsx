"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Search, BookOpen } from "lucide-react";
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
import { createHafalanLembar, deleteHafalanLembar, HafalanLembarFormData } from "../actions";

interface HafalanLembar {
    id: string;
    santri_id: string;
    juz: number;
    lembar: string;
    tanggal: string;
    penguji_id: string | null;
    penguji_nama: string | null;
    catatan: string | null;
    santri: { id: string; nama: string; nis: string } | null;
    penguji: { id: string; nama: string; jenis_kelamin?: "L" | "P" | null } | null;
}

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
}

interface AsatidzOption {
    id: string;
    nama: string;
    jenis_kelamin: "L" | "P" | null;
}

interface HafalanLembarTableProps {
    initialData: HafalanLembar[];
    santriList: SantriOption[];
    asatidzList: AsatidzOption[];
    completedJuzBySantri: Record<string, number[]>; // santri_id -> array of completed juz
    userRole?: string;
}

export function HafalanLembarTable({ initialData, santriList, asatidzList, completedJuzBySantri, userRole = "admin" }: HafalanLembarTableProps) {
    const { showToast } = useToast();
    const [data, setData] = useState<HafalanLembar[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<HafalanLembar | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HafalanLembarFormData>({
        santri_id: "",
        juz: 1,
        lembar: "",
        tanggal: new Date().toISOString().split("T")[0],
        penguji_id: undefined,
        catatan: "",
    });

    const filteredData = data.filter(
        (item) =>
            item.santri?.nama?.toLowerCase().includes(search.toLowerCase()) ||
            item.santri?.nis?.toLowerCase().includes(search.toLowerCase()) ||
            item.lembar.toLowerCase().includes(search.toLowerCase())
    );

    // Get available juz for selected santri (exclude completed ones)
    const getAvailableJuz = () => {
        if (!formData.santri_id) return Array.from({ length: 30 }, (_, i) => i + 1);
        const completed = completedJuzBySantri[formData.santri_id] || [];
        return Array.from({ length: 30 }, (_, i) => i + 1).filter(juz => !completed.includes(juz));
    };

    const handleOpenAdd = () => {
        setFormData({
            santri_id: "",
            juz: 1,
            lembar: "1A",
            tanggal: new Date().toISOString().split("T")[0],
            penguji_id: undefined,
            catatan: "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: HafalanLembar) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createHafalanLembar(formData);
            if (result.error) {
                setError(result.error);
                showToast("error", "Gagal menyimpan", result.error);
            } else {
                showToast("success", "Berhasil!", "Hafalan lembar berhasil disimpan.");
                window.location.reload();
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
            showToast("error", "Error", "Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setLoading(true);

        try {
            const result = await deleteHafalanLembar(deletingItem.id);
            if (result.error) {
                setError(result.error);
                showToast("error", "Gagal menghapus", result.error);
            } else {
                setData((prev) => prev.filter((s) => s.id !== deletingItem.id));
                setIsDeleteDialogOpen(false);
                showToast("success", "Berhasil dihapus!", "Data hafalan lembar telah dihapus.");
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
            showToast("error", "Error", "Terjadi kesalahan, coba lagi.");
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

    return (
        <>
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        {userRole !== "ortu" ? (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari santri atau lembar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        ) : <div></div>}
                        {userRole !== "ortu" && (
                            <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Hafalan
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Juz</TableHead>
                                <TableHead>Lembar</TableHead>
                                <TableHead>Penguji</TableHead>
                                <TableHead>Catatan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data hafalan lembar"}
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
                                        <TableCell>
                                            <Badge variant="secondary">Juz {item.juz}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.lembar}</TableCell>
                                        <TableCell>
                                            {item.penguji ? (
                                                <>
                                                    {item.penguji.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {item.penguji.nama}
                                                </>
                                            ) : (
                                                item.penguji_nama || "-"
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{item.catatan || "-"}</TableCell>
                                        <TableCell className="text-right">
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

            {/* Add Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Hafalan Lembar</DialogTitle>
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
                                    onChange={(newSantriId) => {
                                        // Get first available juz for this santri
                                        const completed = completedJuzBySantri[newSantriId] || [];
                                        const availableJuz = Array.from({ length: 30 }, (_, i) => i + 1).filter(juz => !completed.includes(juz));
                                        const firstAvailableJuz = availableJuz.length > 0 ? availableJuz[0] : 1;
                                        setFormData({ ...formData, santri_id: newSantriId, juz: firstAvailableJuz });
                                    }}
                                    placeholder="-- Pilih Santri --"
                                    searchPlaceholder="Ketik nama santri..."
                                    emptyText="Santri tidak ditemukan"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="juz">Juz *</Label>
                                    <Select
                                        id="juz"
                                        value={formData.juz.toString()}
                                        onChange={(e) => setFormData({ ...formData, juz: parseInt(e.target.value) })}
                                    >
                                        {getAvailableJuz().length === 0 ? (
                                            <option value="">Semua juz selesai</option>
                                        ) : (
                                            getAvailableJuz().map((n) => (
                                                <option key={n} value={n}>Juz {n}</option>
                                            ))
                                        )}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Lembar *</Label>
                                    <div className="flex gap-3 items-center">
                                        <Select
                                            value={formData.lembar.replace(/[AB]/g, '') || "1"}
                                            onChange={(e) => {
                                                const num = e.target.value;
                                                const letter = formData.lembar.match(/[AB]/)?.[0] || "A";
                                                setFormData({ ...formData, lembar: num + letter });
                                            }}
                                            className="w-24"
                                        >
                                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </Select>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="lembar_letter"
                                                    value="A"
                                                    checked={formData.lembar.includes("A")}
                                                    onChange={() => {
                                                        const num = formData.lembar.replace(/[AB]/g, '') || "1";
                                                        setFormData({ ...formData, lembar: num + "A" });
                                                    }}
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-medium">A</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="lembar_letter"
                                                    value="B"
                                                    checked={formData.lembar.includes("B")}
                                                    onChange={() => {
                                                        const num = formData.lembar.replace(/[AB]/g, '') || "1";
                                                        setFormData({ ...formData, lembar: num + "B" });
                                                    }}
                                                    className="w-4 h-4 text-emerald-600"
                                                />
                                                <span className="font-medium">B</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
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
                                    <Label htmlFor="penguji_id">Penguji</Label>
                                    <SearchableSelect
                                        options={asatidzList.map((a) => ({
                                            value: a.id,
                                            label: `${a.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} ${a.nama}`,
                                        }))}
                                        value={formData.penguji_id || ""}
                                        onChange={(value) => setFormData({ ...formData, penguji_id: value || undefined })}
                                        placeholder="-- Pilih Penguji --"
                                        searchPlaceholder="Ketik nama penguji..."
                                        emptyText="Penguji tidak ditemukan"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Input
                                    id="catatan"
                                    value={formData.catatan || ""}
                                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                    placeholder="Catatan tambahan..."
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
                        <DialogTitle>Hapus Hafalan</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        Apakah Anda yakin ingin menghapus data hafalan lembar{" "}
                        <strong>{deletingItem?.lembar}</strong> dari{" "}
                        <strong>{deletingItem?.santri?.nama}</strong>?
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
