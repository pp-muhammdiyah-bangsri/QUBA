"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, FileText, CheckCircle, XCircle } from "lucide-react";
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
import { createNilai, updateNilai, deleteNilai, NilaiFormData } from "../actions";

interface Nilai {
    id: string;
    santri_id: string;
    mapel_id: string;
    semester: string;
    nilai_uh: number | null;
    nilai_uts: number | null;
    nilai_uas: number | null;
    nilai_akhir: number | null;
    catatan: string | null;
    santri: { id: string; nama: string; nis: string; jenjang: string } | null;
    mapel: { id: string; nama: string; kategori: string; kkm: number } | null;
}

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
}

interface MapelOption {
    id: string;
    nama: string;
    kategori: string;
    kkm: number;
}

interface NilaiTableProps {
    initialData: Nilai[];
    santriList: SantriOption[];
    mapelList: MapelOption[];
    semesterOptions: string[];
}

export function NilaiTable({ initialData, santriList, mapelList, semesterOptions }: NilaiTableProps) {
    const [data, setData] = useState<Nilai[]>(initialData);
    const [search, setSearch] = useState("");
    const [filterSemester, setFilterSemester] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Nilai | null>(null);
    const [deletingItem, setDeletingItem] = useState<Nilai | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<NilaiFormData>({
        santri_id: "",
        mapel_id: "",
        semester: semesterOptions[0] || "",
        nilai_uh: undefined,
        nilai_uts: undefined,
        nilai_uas: undefined,
        catatan: "",
    });

    const filteredData = data.filter((item) => {
        const matchSearch =
            item.santri?.nama?.toLowerCase().includes(search.toLowerCase()) ||
            item.mapel?.nama?.toLowerCase().includes(search.toLowerCase());
        const matchSemester = !filterSemester || item.semester === filterSemester;
        return matchSearch && matchSemester;
    });

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            santri_id: "",
            mapel_id: "",
            semester: semesterOptions[0] || "",
            nilai_uh: undefined,
            nilai_uts: undefined,
            nilai_uas: undefined,
            catatan: "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: Nilai) => {
        setEditingItem(item);
        setFormData({
            santri_id: item.santri_id,
            mapel_id: item.mapel_id,
            semester: item.semester,
            nilai_uh: item.nilai_uh || undefined,
            nilai_uts: item.nilai_uts || undefined,
            nilai_uas: item.nilai_uas || undefined,
            catatan: item.catatan || "",
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Nilai) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingItem) {
                const result = await updateNilai(editingItem.id, formData);
                if (result.error) {
                    setError(result.error);
                } else {
                    window.location.reload();
                }
            } else {
                const result = await createNilai(formData);
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
            const result = await deleteNilai(deletingItem.id);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) => prev.filter((n) => n.id !== deletingItem.id));
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const getGradeStatus = (nilai: number | null, kkm: number) => {
        if (nilai === null) return null;
        return nilai >= kkm;
    };

    // Stats
    const passCount = filteredData.filter((n) => n.nilai_akhir !== null && n.mapel && n.nilai_akhir >= n.mapel.kkm).length;
    const failCount = filteredData.filter((n) => n.nilai_akhir !== null && n.mapel && n.nilai_akhir < n.mapel.kkm).length;

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{filteredData.length}</div>
                                <div className="text-sm text-gray-500">Total Nilai</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-700">{passCount}</div>
                                <div className="text-sm text-green-600">Tuntas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-700">{failCount}</div>
                                <div className="text-sm text-red-600">Belum Tuntas</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari santri/mapel..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                className="w-full sm:w-48"
                            >
                                <option value="">Semua Semester</option>
                                {semesterOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handleOpenAdd} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Input Nilai
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Santri</TableHead>
                                <TableHead>Mapel</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead className="text-center">UH</TableHead>
                                <TableHead className="text-center">UTS</TableHead>
                                <TableHead className="text-center">UAS</TableHead>
                                <TableHead className="text-center">Akhir</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        {search || filterSemester ? "Tidak ada data yang cocok" : "Belum ada data nilai"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => {
                                    const isPassed = getGradeStatus(item.nilai_akhir, item.mapel?.kkm || 0);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.santri?.nama || "-"}</div>
                                                    <div className="text-xs text-gray-500">{item.santri?.nis}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{item.mapel?.nama || "-"}</div>
                                                    <div className="text-xs text-gray-500">KKM: {item.mapel?.kkm}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{item.semester}</TableCell>
                                            <TableCell className="text-center">{item.nilai_uh ?? "-"}</TableCell>
                                            <TableCell className="text-center">{item.nilai_uts ?? "-"}</TableCell>
                                            <TableCell className="text-center">{item.nilai_uas ?? "-"}</TableCell>
                                            <TableCell className="text-center font-bold">{item.nilai_akhir ?? "-"}</TableCell>
                                            <TableCell>
                                                {isPassed !== null && (
                                                    <Badge variant={isPassed ? "success" : "destructive"}>
                                                        {isPassed ? "Tuntas" : "Belum"}
                                                    </Badge>
                                                )}
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
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent onClose={() => setIsDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Nilai" : "Input Nilai Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
                        )}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="santri_id">Santri *</Label>
                                <Select
                                    id="santri_id"
                                    value={formData.santri_id}
                                    onChange={(e) => setFormData({ ...formData, santri_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Santri --</option>
                                    {santriList.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama} ({s.nis})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mapel_id">Mata Pelajaran *</Label>
                                    <Select
                                        id="mapel_id"
                                        value={formData.mapel_id}
                                        onChange={(e) => setFormData({ ...formData, mapel_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Pilih Mapel --</option>
                                        {mapelList.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nama}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="semester">Semester *</Label>
                                    <Select
                                        id="semester"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        required
                                    >
                                        {semesterOptions.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nilai_uh">Nilai UH</Label>
                                    <Input
                                        id="nilai_uh"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.nilai_uh ?? ""}
                                        onChange={(e) => setFormData({ ...formData, nilai_uh: e.target.value ? parseInt(e.target.value) : undefined })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nilai_uts">Nilai UTS</Label>
                                    <Input
                                        id="nilai_uts"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.nilai_uts ?? ""}
                                        onChange={(e) => setFormData({ ...formData, nilai_uts: e.target.value ? parseInt(e.target.value) : undefined })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nilai_uas">Nilai UAS</Label>
                                    <Input
                                        id="nilai_uas"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.nilai_uas ?? ""}
                                        onChange={(e) => setFormData({ ...formData, nilai_uas: e.target.value ? parseInt(e.target.value) : undefined })}
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

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Nilai</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Hapus nilai <strong>{deletingItem?.mapel?.nama}</strong> untuk{" "}
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
