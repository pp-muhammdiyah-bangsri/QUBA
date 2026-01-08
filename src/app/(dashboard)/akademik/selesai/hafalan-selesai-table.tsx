"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Search, Award, CheckCircle2, Plus, Trash2 } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createHafalanSelesai, deleteHafalanSelesai, HafalanSelesaiFormData } from "../actions";

interface HafalanSelesai {
    id: string;
    santri_id: string;
    juz: number;
    nilai: string | null;
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

interface HafalanSelesaiTableProps {
    initialData: HafalanSelesai[];
    santriList: SantriOption[];
    asatidzList: AsatidzOption[];
    userRole?: string;
}

export function HafalanSelesaiTable({ initialData, santriList, asatidzList, userRole = "admin" }: HafalanSelesaiTableProps) {
    const { showToast } = useToast();
    const [data, setData] = useState<HafalanSelesai[]>(initialData);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState<HafalanSelesai | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<HafalanSelesai | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HafalanSelesaiFormData>({
        santri_id: "",
        juz: 1,
        tanggal: new Date().toISOString().split("T")[0],
        penguji_id: undefined,
        nilai: "",
        catatan: "",
    });

    const filteredData = data.filter(
        (item) =>
            item.santri?.nama?.toLowerCase().includes(search.toLowerCase()) ||
            item.santri?.nis?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setFormData({
            santri_id: "",
            juz: 1,
            tanggal: new Date().toISOString().split("T")[0],
            penguji_id: undefined,
            nilai: "",
            catatan: "",
        });
        setError(null);
        setIsAddDialogOpen(true);
    };

    const handleOpenDelete = (item: HafalanSelesai) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await createHafalanSelesai(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        showToast("success", "Hafalan selesai berhasil ditambahkan! 20 lembar otomatis tercatat.");
        setIsAddDialogOpen(false);
        setLoading(false);
        // Refresh page to get updated data
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setLoading(true);

        const result = await deleteHafalanSelesai(deletingItem.id);

        if (result.error) {
            showToast("error", result.error);
            setLoading(false);
            return;
        }

        showToast("success", "Hafalan selesai berhasil dihapus");
        setData(data.filter((d) => d.id !== deletingItem.id));
        setIsDeleteDialogOpen(false);
        setDeletingItem(null);
        setLoading(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Group by santri for summary stats
    const santriStats = data.reduce((acc, item) => {
        const key = item.santri_id;
        if (!acc[key]) {
            acc[key] = { nama: item.santri?.nama || "", nis: item.santri?.nis || "", count: 0 };
        }
        acc[key].count++;
        return acc;
    }, {} as Record<string, { nama: string; nis: string; count: number }>);

    const topSantri = Object.values(santriStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Top Performers */}
            {topSantri.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {topSantri.map((s, idx) => (
                        <Card key={idx} className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 dark:border dark:border-emerald-900/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-100 dark:border-emerald-800/50">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-emerald-900 dark:text-emerald-100 truncate">{s.nama}</div>
                                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{s.count} Juz</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        {userRole !== "ortu" ? (
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari santri..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        ) : <div></div>}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Total: {data.length} Juz Selesai
                            </div>
                            {userRole !== "ortu" && (
                                <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
                                    <Plus className="w-4 h-4" />
                                    Tambah
                                </Button>
                            )}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Juz</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Penguji</TableHead>
                                <TableHead>Catatan</TableHead>
                                <TableHead className="w-16">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        <Award className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada Juz yang selesai"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setIsDetailOpen(true);
                                        }}
                                    >
                                        <TableCell>{formatDate(item.tanggal)}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.santri?.nama || "-"}</div>
                                                <div className="text-xs text-gray-500">{item.santri?.nis}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="success" className="gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Juz {item.juz}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.nilai ? (
                                                <span className="font-semibold text-emerald-600">{item.nilai}</span>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
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
                                        <TableCell>
                                            {userRole !== "ortu" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDelete(item);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent onClose={() => setIsAddDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Hafalan Selesai</DialogTitle>
                        <DialogDescription>
                            Akan otomatis menambahkan 20 lembar progress untuk juz ini
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
                                    <Label htmlFor="juz">Juz *</Label>
                                    <Select
                                        id="juz"
                                        value={formData.juz.toString()}
                                        onChange={(e) => setFormData({ ...formData, juz: parseInt(e.target.value) })}
                                        className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                    >
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                                            <option key={n} value={n} className="bg-white text-black dark:bg-zinc-800 dark:text-white">Juz {n}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal Selesai *</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="penguji_id">Penguji</Label>
                                    <SearchableSelect
                                        options={asatidzList.map((a) => ({
                                            value: a.id,
                                            label: `${a.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} ${a.nama}`,
                                        }))}
                                        value={formData.penguji_id || ""}
                                        onChange={(value) => setFormData({ ...formData, penguji_id: value || undefined })}
                                        placeholder="-- Tidak Ada --"
                                        searchPlaceholder="Ketik nama penguji..."
                                        emptyText="Penguji tidak ditemukan"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nilai">Waktu (opsional)</Label>
                                    <Input
                                        id="nilai"
                                        placeholder="contoh: 6 bulan"
                                        value={formData.nilai || ""}
                                        onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Input
                                    id="catatan"
                                    placeholder="Catatan tambahan..."
                                    value={formData.catatan || ""}
                                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
                        <DialogTitle>Hapus Hafalan Selesai?</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus data hafalan Juz {deletingItem?.juz} untuk {deletingItem?.santri?.nama}?
                            Data yang dihapus tidak dapat dikembalikan.
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

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg bg-white dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle>Detail Hafalan Selesai</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap penyelesaian hafalan juz
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-gray-500">Santri</Label>
                                    <div className="font-medium text-lg">{selectedItem.santri?.nama}</div>
                                    <div className="text-sm text-gray-500">{selectedItem.santri?.nis}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500">Juz</Label>
                                    <div>
                                        <Badge variant="success" className="text-base px-3 py-1">
                                            Juz {selectedItem.juz}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-gray-500">Waktu Penyelesaian</Label>
                                    <div className="font-medium">{selectedItem.nilai || "-"}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500">Tanggal Selesai</Label>
                                    <div className="font-medium">{formatDate(selectedItem.tanggal)}</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-gray-500">Penguji</Label>
                                <div className="font-medium">
                                    {selectedItem.penguji ? (
                                        <>
                                            {selectedItem.penguji.jenis_kelamin === "P" ? "Ustadzah" : "Ustadz"} {selectedItem.penguji.nama}
                                        </>
                                    ) : (
                                        selectedItem.penguji_nama || "-"
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-500">Catatan & Evaluasi</Label>
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                                    {selectedItem.catatan || "Tidak ada catatan khusus."}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
