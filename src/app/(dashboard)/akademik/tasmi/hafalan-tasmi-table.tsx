"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Star, Medal } from "lucide-react";
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
import { createHafalanTasmi, deleteHafalanTasmi, HafalanTasmiFormData } from "../actions";

interface HafalanTasmi {
    id: string;
    santri_id: string;
    juz: number;
    tanggal: string;
    penguji_id: string | null;
    penguji_nama: string | null;
    predikat: "mumtaz" | "jayyid" | "maqbul";
    nilai: number | null;
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

interface HafalanTasmiTableProps {
    initialData: HafalanTasmi[];
    santriList: SantriOption[];
    asatidzList: AsatidzOption[];
    userRole?: string;
}

const predikatColors: Record<string, string> = {
    mumtaz: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    jayyid: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    maqbul: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
};

const predikatIcons: Record<string, React.ReactNode> = {
    mumtaz: <Star className="w-3 h-3" />,
    jayyid: <Medal className="w-3 h-3" />,
    maqbul: null,
};

export function HafalanTasmiTable({ initialData, santriList, asatidzList, userRole = "admin" }: HafalanTasmiTableProps) {
    const [data, setData] = useState<HafalanTasmi[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<HafalanTasmi | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<HafalanTasmiFormData>({
        santri_id: "",
        juz: 1,
        tanggal: new Date().toISOString().split("T")[0],
        penguji_id: undefined,
        predikat: "jayyid",
        nilai: undefined,
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
            predikat: "jayyid",
            nilai: undefined,
            catatan: "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: HafalanTasmi) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createHafalanTasmi(formData);
            if (result.error) {
                setError(result.error);
            } else {
                window.location.reload();
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
            const result = await deleteHafalanTasmi(deletingItem.id);
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
    const stats = data.reduce(
        (acc, item) => {
            acc[item.predikat]++;
            return acc;
        },
        { mumtaz: 0, jayyid: 0, maqbul: 0 }
    );

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40 dark:border dark:border-yellow-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-100 dark:border-yellow-800/50">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.mumtaz}</div>
                                <div className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Mumtaz</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border dark:border-blue-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                                <Medal className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.jayyid}</div>
                                <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Jayyid</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/40 dark:to-slate-900/40 dark:border dark:border-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-500/10 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 flex items-center justify-center font-bold border border-gray-100 dark:border-gray-700/50">
                                M
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.maqbul}</div>
                                <div className="text-sm text-gray-600/80 dark:text-gray-400/80">Maqbul</div>
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari santri..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        ) : <div></div>}
                        {userRole !== "ortu" && (
                            <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Input Tasmi'
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Juz</TableHead>
                                <TableHead>Predikat</TableHead>
                                <TableHead>Nilai</TableHead>
                                <TableHead>Penguji</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        <Medal className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data tasmi'"}
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
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${predikatColors[item.predikat]}`}>
                                                {predikatIcons[item.predikat]}
                                                {item.predikat.charAt(0).toUpperCase() + item.predikat.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {item.nilai !== null ? (
                                                <span className="font-semibold">{item.nilai}</span>
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
                                        <TableCell className="text-right">
                                            {userRole !== "ortu" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDelete(item)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Input Tasmi'</DialogTitle>
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
                                    >
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                                            <option key={n} value={n}>Juz {n}</option>
                                        ))}
                                    </Select>
                                </div>
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
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="predikat">Predikat *</Label>
                                    <Select
                                        id="predikat"
                                        value={formData.predikat}
                                        onChange={(e) => setFormData({ ...formData, predikat: e.target.value as "mumtaz" | "jayyid" | "maqbul" })}
                                        className={predikatColors[formData.predikat]}
                                    >
                                        <option value="mumtaz" className="bg-white text-black dark:bg-zinc-800 dark:text-white">Mumtaz (Istimewa)</option>
                                        <option value="jayyid" className="bg-white text-black dark:bg-zinc-800 dark:text-white">Jayyid (Baik)</option>
                                        <option value="maqbul" className="bg-white text-black dark:bg-zinc-800 dark:text-white">Maqbul (Cukup)</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nilai">Nilai (0-100)</Label>
                                    <Input
                                        id="nilai"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.nilai || ""}
                                        onChange={(e) => setFormData({ ...formData, nilai: e.target.value ? parseInt(e.target.value) : undefined })}
                                        placeholder="Opsional"
                                    />
                                </div>
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
                        <DialogTitle>Hapus Tasmi'</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus data tasmi Juz {deletingItem?.juz} dari{" "}
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
