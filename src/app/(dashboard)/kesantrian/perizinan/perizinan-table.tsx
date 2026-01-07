"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
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
import { createPerizinan, updatePerizinanStatus, deletePerizinan, PerizinanFormData } from "../actions";

interface Perizinan {
    id: string;
    santri_id: string;
    alasan: string;
    status: "pending" | "approved" | "rejected";
    tgl_mulai: string;
    tgl_selesai: string;
    santri: { id: string; nama: string; nis: string; jenjang: string } | null;
}

interface SantriOption {
    id: string;
    nama: string;
    nis: string;
}

interface PerizinanTableProps {
    initialData: Perizinan[];
    santriList: SantriOption[];
    userRole?: string;
    linkedSantriId?: string | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
};

export function PerizinanTable({ initialData, santriList, userRole = "admin", linkedSantriId }: PerizinanTableProps) {
    const [data, setData] = useState<Perizinan[]>(initialData);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Perizinan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PerizinanFormData>({
        santri_id: "",
        alasan: "",
        status: "pending",
        tgl_mulai: new Date().toISOString().split("T")[0],
        tgl_selesai: new Date().toISOString().split("T")[0],
    });

    const filteredData = data.filter(
        (item) =>
            item.santri?.nama?.toLowerCase().includes(search.toLowerCase()) ||
            item.alasan.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setFormData({
            santri_id: userRole === "ortu" && linkedSantriId ? linkedSantriId : "",
            alasan: "",
            status: "pending",
            tgl_mulai: new Date().toISOString().split("T")[0],
            tgl_selesai: new Date().toISOString().split("T")[0],
        });
        setError(null);
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (item: Perizinan) => {
        setDeletingItem(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createPerizinan(formData);
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

    const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
        setLoading(true);
        try {
            const result = await updatePerizinanStatus(id, status);
            if (result.error) {
                setError(result.error);
            } else {
                setData((prev) =>
                    prev.map((p) => (p.id === id ? { ...p, status } : p))
                );
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
            const result = await deletePerizinan(deletingItem.id);
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
    const stats = {
        pending: data.filter((p) => p.status === "pending").length,
        approved: data.filter((p) => p.status === "approved").length,
        rejected: data.filter((p) => p.status === "rejected").length,
    };

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40 dark:border dark:border-yellow-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-100 dark:border-yellow-800/50">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</div>
                                <div className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Menunggu</div>
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
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.approved}</div>
                                <div className="text-sm text-green-600/80 dark:text-green-400/80">Disetujui</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 dark:border dark:border-red-900/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-800/50">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</div>
                                <div className="text-sm text-red-600/80 dark:text-red-400/80">Ditolak</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        {userRole !== "ortu" ? (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Cari santri atau alasan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        ) : <div></div>}
                        <Button onClick={handleOpenAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Ajukan Izin
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Santri</TableHead>
                                <TableHead>Alasan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
                                        {search ? "Tidak ada data yang cocok" : "Belum ada data perizinan"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{formatDate(item.tgl_mulai)}</div>
                                                <div className="text-gray-400">s/d {formatDate(item.tgl_selesai)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.santri?.nama || "-"}</div>
                                                <div className="text-xs text-gray-500">{item.santri?.nis}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[250px]">{item.alasan}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
                                                {statusLabels[item.status]}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {userRole !== "ortu" && item.status === "pending" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(item.id, "approved")}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(item.id, "rejected")}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
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
                        <DialogTitle>Ajukan Izin</DialogTitle>
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
                                {userRole === "ortu" && linkedSantriId ? (
                                    <Input
                                        value={santriList.find(s => s.id === linkedSantriId)?.nama || "Anak Anda"}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                ) : (
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
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tgl_mulai">Tanggal Mulai *</Label>
                                    <Input
                                        id="tgl_mulai"
                                        type="date"
                                        value={formData.tgl_mulai}
                                        onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tgl_selesai">Tanggal Selesai *</Label>
                                    <Input
                                        id="tgl_selesai"
                                        type="date"
                                        value={formData.tgl_selesai}
                                        onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="alasan">Alasan Izin *</Label>
                                <Input
                                    id="alasan"
                                    value={formData.alasan}
                                    onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Menyimpan..." : "Ajukan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus Perizinan</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus data izin{" "}
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
