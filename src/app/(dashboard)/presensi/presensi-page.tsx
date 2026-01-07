"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Calendar, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    createKegiatan,
    updateKegiatan,
    deleteKegiatan,
    bulkCreatePresensi,
    getPresensiByKegiatan,
    KegiatanFormData
} from "./actions";

interface Kegiatan {
    id: string;
    nama: string;
    jenis: "pembelajaran" | "kajian" | "event_umum";
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    lokasi: string | null;
    deskripsi: string | null;
    jadwal_rutin_id?: string | null;
}

interface Santri {
    id: string;
    nama: string;
    nis: string;
    jenjang: "SMP" | "SMA";
    kelas_id: string | null;
    halaqoh_id: string | null;
}

interface Option {
    id: string;
    nama: string;
}

interface PresensiPageProps {
    initialKegiatan: Kegiatan[];
    santriList: Santri[];
    kelasList: Option[];
    halaqohList: Option[];
    myGroups: { kelasId: string | null; halaqohId: string | null };
    userRole: string;
}

const jenisColors: Record<string, string> = {
    pembelajaran: "bg-blue-100 text-blue-800",
    kajian: "bg-purple-100 text-purple-800",
    event_umum: "bg-green-100 text-green-800",
};

const jenisLabels: Record<string, string> = {
    pembelajaran: "Pembelajaran",
    kajian: "Kajian",
    event_umum: "Event Umum",
};

const NAMA_KEGIATAN_OPTIONS = ["Halaqoh Pagi", "Halaqoh Sore", "KBM", "Kajian Ba'da Maghrib/Isya"];
const LOKASI_OPTIONS = ["Masjid al-Hikmah", "Asrama"];

export function PresensiPage({ initialKegiatan, santriList, kelasList, halaqohList, myGroups, userRole }: PresensiPageProps) {
    const [kegiatan, setKegiatan] = useState<Kegiatan[]>(initialKegiatan);
    const [search, setSearch] = useState("");
    const [isKegiatanDialogOpen, setIsKegiatanDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isPresensiDialogOpen, setIsPresensiDialogOpen] = useState(false);
    const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
    const [deletingKegiatan, setDeletingKegiatan] = useState<Kegiatan | null>(null);
    const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Input List State
    const [namaMode, setNamaMode] = useState<string>("Lainnya");
    const [lokasiMode, setLokasiMode] = useState<string>("Lainnya");

    // Smart Attendance State
    const [filterType, setFilterType] = useState<"all" | "kelas" | "halaqoh">("all");
    const [filterId, setFilterId] = useState<string>("");

    // Auto-select filter based on My Group
    const setMyGroup = () => {
        if (myGroups.kelasId) {
            setFilterType("kelas");
            setFilterId(myGroups.kelasId);
        } else if (myGroups.halaqohId) {
            setFilterType("halaqoh");
            setFilterId(myGroups.halaqohId);
        } else {
            setFilterType("all");
            setFilterId("");
        }
    };


    const [kegiatanForm, setKegiatanForm] = useState<KegiatanFormData>({
        nama: "",
        jenis: "pembelajaran",
        tanggal_mulai: new Date().toISOString().split("T")[0],
        tanggal_selesai: "",
        lokasi: "",
        deskripsi: "",
    });

    const [presensiData, setPresensiData] = useState<Record<string, { status: string; catatan: string }>>({});

    const filteredKegiatan = kegiatan.filter(
        (k) => k.nama.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAddKegiatan = () => {
        setEditingKegiatan(null);
        setNamaMode(NAMA_KEGIATAN_OPTIONS[0]);
        setLokasiMode(LOKASI_OPTIONS[0]);
        setKegiatanForm({
            nama: NAMA_KEGIATAN_OPTIONS[0],
            jenis: "pembelajaran",
            tanggal_mulai: new Date().toISOString().split("T")[0],
            tanggal_selesai: "",
            lokasi: LOKASI_OPTIONS[0],
            deskripsi: "",
        });
        setError(null);
        setIsKegiatanDialogOpen(true);
    };

    const handleOpenEditKegiatan = (k: Kegiatan) => {
        setEditingKegiatan(k);
        const nm = NAMA_KEGIATAN_OPTIONS.includes(k.nama) ? k.nama : "Lainnya";
        const lm = LOKASI_OPTIONS.includes(k.lokasi || "") ? k.lokasi || "" : "Lainnya";
        setNamaMode(nm);
        setLokasiMode(lm);
        setKegiatanForm({
            nama: k.nama,
            jenis: k.jenis,
            tanggal_mulai: k.tanggal_mulai.split("T")[0],
            tanggal_selesai: k.tanggal_selesai?.split("T")[0] || "",
            lokasi: k.lokasi || "",
            deskripsi: k.deskripsi || "",
        });
        setError(null);
        setIsKegiatanDialogOpen(true);
    };

    const handleOpenDeleteKegiatan = (k: Kegiatan) => {
        setDeletingKegiatan(k);
        setIsDeleteDialogOpen(true);
    };

    const handleOpenPresensi = async (k: Kegiatan) => {
        setSelectedKegiatan(k);
        setLoading(true);

        // Load existing presensi
        const existing = await getPresensiByKegiatan(k.id);
        const presensiMap: Record<string, { status: string; catatan: string }> = {};

        // Initialize all santri with 'hadir' as default
        santriList.forEach((s) => {
            presensiMap[s.id] = { status: "hadir", catatan: "" };
        });

        // Override with existing data
        existing.forEach((p: { santri_id: string; status: string; catatan: string | null }) => {
            presensiMap[p.santri_id] = { status: p.status, catatan: p.catatan || "" };
        });

        setPresensiData(presensiMap);

        // Auto-select filter for Ustadz
        if (userRole !== "admin") {
            if (myGroups.kelasId) {
                setFilterType("kelas");
                setFilterId(myGroups.kelasId);
            } else if (myGroups.halaqohId) {
                setFilterType("halaqoh");
                setFilterId(myGroups.halaqohId);
            } else {
                // Warning: Ustadz with no group
                // Ideally show alert, but for now just set to something valid or empty
                setFilterType("kelas" as any); // Fallback
            }
        } else {
            setFilterType("all");
            setFilterId("");
        }

        setLoading(false);
        setIsPresensiDialogOpen(true);
    };

    const handleSubmitKegiatan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingKegiatan) {
                const result = await updateKegiatan(editingKegiatan.id, kegiatanForm);
                if (result.error) {
                    setError(result.error);
                } else {
                    window.location.reload();
                }
            } else {
                const result = await createKegiatan(kegiatanForm);
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

    const handleDeleteKegiatan = async () => {
        if (!deletingKegiatan) return;
        setLoading(true);

        try {
            const result = await deleteKegiatan(deletingKegiatan.id);
            if (result.error) {
                setError(result.error);
            } else {
                setKegiatan((prev) => prev.filter((k) => k.id !== deletingKegiatan.id));
                setIsDeleteDialogOpen(false);
            }
        } catch {
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPresensi = async () => {
        if (!selectedKegiatan) return;
        setLoading(true);

        try {
            const presensiList = Object.entries(presensiData).map(([santri_id, data]) => ({
                santri_id,
                status: data.status,
                catatan: data.catatan,
            }));

            const result = await bulkCreatePresensi(selectedKegiatan.id, presensiList);
            if (result.error) {
                setError(result.error);
            } else {
                setIsPresensiDialogOpen(false);
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

    const filteredSantri = santriList.filter((s) => {
        // Admin Logic
        if (userRole === "admin") {
            if (filterType === "all") return true;
            // If specific filter selected but no ID, show nothing to keep clean
            if (filterType === "kelas") return filterId ? s.kelas_id === filterId : false;
            if (filterType === "halaqoh") return filterId ? s.halaqoh_id === filterId : false;
            return true;
        }

        // Ustadz Strict Logic
        // 1. Cannot use 'all' filter
        if (filterType === "all") return false;

        // 2. Class Filter: Must match assigned class and user selection
        if (filterType === "kelas") {
            if (!myGroups.kelasId || filterId !== myGroups.kelasId) return false;
            return s.kelas_id === filterId;
        }

        // 3. Halaqoh Filter: Must match assigned halaqoh and user selection
        if (filterType === "halaqoh") {
            if (!myGroups.halaqohId || filterId !== myGroups.halaqohId) return false;
            return s.halaqoh_id === filterId;
        }

        // Default deny
        return false;
    });

    const handleMarkAllPresent = () => {
        setPresensiData((prev) => {
            const next = { ...prev };
            filteredSantri.forEach((s) => {
                next[s.id] = { status: "hadir", catatan: prev[s.id]?.catatan || "" };
            });
            return next;
        });
    };

    // Quick stats
    const stats = {
        total: kegiatan.length,
        pembelajaran: kegiatan.filter((k) => k.jenis === "pembelajaran").length,
        kajian: kegiatan.filter((k) => k.jenis === "kajian").length,
        event: kegiatan.filter((k) => k.jenis === "event_umum").length,
    };

    return (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold">{stats.total}</div>
                                <div className="text-sm text-gray-500">Total Kegiatan</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-blue-700">{stats.pembelajaran}</div>
                                <div className="text-sm text-blue-600">Pembelajaran</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-purple-700">{stats.kajian}</div>
                                <div className="text-sm text-purple-600">Kajian</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-green-700">{stats.event}</div>
                                <div className="text-sm text-green-600">Event Umum</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kegiatan Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Kegiatan</CardTitle>
                    <Button onClick={handleOpenAddKegiatan}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kegiatan
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Cari kegiatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Nama Kegiatan</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredKegiatan.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        {search ? "Tidak ada kegiatan yang cocok" : "Belum ada kegiatan"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredKegiatan.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell>{formatDate(k.tanggal_mulai)}</TableCell>
                                        <TableCell className="font-medium">{k.nama}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${jenisColors[k.jenis]}`}>
                                                {jenisLabels[k.jenis]}
                                            </span>
                                        </TableCell>
                                        <TableCell>{k.lokasi || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenPresensi(k)}
                                                className="mr-2"
                                                disabled={(() => {
                                                    // Simple client-side check for UI feedback
                                                    // Ideally we pass server time or pre-calculated status
                                                    if (!k.jadwal_rutin_id) return false;
                                                    // We don't have jadwal_rutin loaded here yet. 
                                                    // For MVP, we'll let them click but Server Action will reject.
                                                    // Or we can add status badge in next iteration.
                                                    return false;
                                                })()}
                                            >
                                                <Users className="w-4 h-4 mr-1" />
                                                Presensi
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditKegiatan(k)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDeleteKegiatan(k)}
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

            {/* Add/Edit Kegiatan Dialog */}
            <Dialog open={isKegiatanDialogOpen} onOpenChange={setIsKegiatanDialogOpen}>
                <DialogContent onClose={() => setIsKegiatanDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingKegiatan ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitKegiatan}>
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Kegiatan *</Label>
                                <div className="space-y-2">
                                    <Select
                                        value={namaMode}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNamaMode(val);
                                            if (val !== "Lainnya") {
                                                setKegiatanForm({ ...kegiatanForm, nama: val });
                                            } else {
                                                setKegiatanForm({ ...kegiatanForm, nama: "" });
                                            }
                                        }}
                                    >
                                        {NAMA_KEGIATAN_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        <option value="Lainnya">Lainnya (Ketik Manual)</option>
                                    </Select>
                                    {namaMode === "Lainnya" && (
                                        <Input
                                            id="nama"
                                            placeholder="Masukkan nama kegiatan..."
                                            value={kegiatanForm.nama}
                                            onChange={(e) => setKegiatanForm({ ...kegiatanForm, nama: e.target.value })}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jenis">Jenis *</Label>
                                    <Select
                                        id="jenis"
                                        value={kegiatanForm.jenis}
                                        onChange={(e) => setKegiatanForm({ ...kegiatanForm, jenis: e.target.value as "pembelajaran" | "kajian" | "event_umum" })}
                                    >
                                        <option value="pembelajaran">Pembelajaran</option>
                                        <option value="kajian">Kajian</option>
                                        <option value="event_umum">Event Umum</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi</Label>
                                    <div className="space-y-2">
                                        <Select
                                            value={lokasiMode}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setLokasiMode(val);
                                                if (val !== "Lainnya") {
                                                    setKegiatanForm({ ...kegiatanForm, lokasi: val });
                                                } else {
                                                    setKegiatanForm({ ...kegiatanForm, lokasi: "" });
                                                }
                                            }}
                                        >
                                            {LOKASI_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                            <option value="Lainnya">Lainnya</option>
                                        </Select>
                                        {lokasiMode === "Lainnya" && (
                                            <Input
                                                id="lokasi"
                                                placeholder="Masukkan lokasi..."
                                                value={kegiatanForm.lokasi || ""}
                                                onChange={(e) => setKegiatanForm({ ...kegiatanForm, lokasi: e.target.value })}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
                                    <Input
                                        id="tanggal_mulai"
                                        type="date"
                                        value={kegiatanForm.tanggal_mulai}
                                        onChange={(e) => setKegiatanForm({ ...kegiatanForm, tanggal_mulai: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                                    <Input
                                        id="tanggal_selesai"
                                        type="date"
                                        value={kegiatanForm.tanggal_selesai || ""}
                                        onChange={(e) => setKegiatanForm({ ...kegiatanForm, tanggal_selesai: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Input
                                    id="deskripsi"
                                    value={kegiatanForm.deskripsi || ""}
                                    onChange={(e) => setKegiatanForm({ ...kegiatanForm, deskripsi: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsKegiatanDialogOpen(false)}>
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
                        <DialogTitle>Hapus Kegiatan</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus kegiatan{" "}
                        <strong>{deletingKegiatan?.nama}</strong>? Data presensi terkait juga akan dihapus.
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
                            onClick={handleDeleteKegiatan}
                            disabled={loading}
                        >
                            {loading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Presensi Input Dialog */}
            <Dialog open={isPresensiDialogOpen} onOpenChange={setIsPresensiDialogOpen}>
                <DialogContent onClose={() => setIsPresensiDialogOpen(false)} className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Input Presensi - {selectedKegiatan?.nama}</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4 py-4">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1 space-y-2">
                                <Label>Filter Grup</Label>
                                <Select
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value as any);
                                        setFilterId("");
                                    }}
                                >
                                    {userRole === "admin" && <option value="all">Semua Santri</option>}
                                    {(userRole === "admin" || myGroups.kelasId) && <option value="kelas">Per Kelas</option>}
                                    {(userRole === "admin" || myGroups.halaqohId) && <option value="halaqoh">Per Halaqoh</option>}
                                </Select>
                            </div>

                            {filterType !== "all" && (
                                <div className="flex-1 space-y-2">
                                    <Label>Pilih {filterType === "kelas" ? "Kelas" : "Halaqoh"}</Label>
                                    <Select
                                        value={filterId}
                                        onChange={(e) => setFilterId(e.target.value)}
                                    >
                                        <option value="">-- Pilih --</option>
                                        {filterType === "kelas"
                                            ? kelasList
                                                .filter(k => userRole === "admin" || k.id === myGroups.kelasId)
                                                .map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)
                                            : halaqohList
                                                .filter(h => userRole === "admin" || h.id === myGroups.halaqohId)
                                                .map((h) => <option key={h.id} value={h.id}>{h.nama}</option>)
                                        }
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-end">
                                <Button onClick={handleMarkAllPresent} type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Tandai Semua Hadir
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-md overflow-hidden max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Santri</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSantri.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{s.nama}</div>
                                                    <div className="text-xs text-gray-500">{s.nis}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={s.jenjang === "SMP" ? "secondary" : "default"}>
                                                    {s.jenjang}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {["hadir", "izin", "sakit", "alpa"].map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            onClick={() => setPresensiData((prev) => ({
                                                                ...prev,
                                                                [s.id]: { ...prev[s.id], status },
                                                            }))}
                                                            className={`px-2 py-1 text-xs rounded-md transition-colors ${presensiData[s.id]?.status === status
                                                                ? status === "hadir" ? "bg-green-500 text-white"
                                                                    : status === "izin" ? "bg-blue-500 text-white"
                                                                        : status === "sakit" ? "bg-yellow-500 text-white"
                                                                            : "bg-red-500 text-white"
                                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPresensiDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmitPresensi} disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Presensi"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
