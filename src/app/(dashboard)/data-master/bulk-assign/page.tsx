"use client";

import { useEffect, useState } from "react";
import { getSantriForBulk, bulkUpdateSantri, BulkAssignFilters } from "./actions";
import { getKelasDropdown, getHalaqohDropdown } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Filter, X } from "lucide-react";

export default function BulkAssignPage() {
    const [santriList, setSantriList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Dropdown Data
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [halaqohList, setHalaqohList] = useState<any[]>([]);

    // Filters
    const [filters, setFilters] = useState<BulkAssignFilters>({
        status: "aktif",
        noKelas: true, // Default to showing students without class
    });

    // Action State
    const [assignType, setAssignType] = useState<"kelas" | "halaqoh">("kelas");
    const [targetId, setTargetId] = useState<string>("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Load Dictionary
        getKelasDropdown().then(setKelasList);
        getHalaqohDropdown().then(setHalaqohList);
    }, []);

    useEffect(() => {
        loadSantri();
    }, [filters]);

    const loadSantri = async () => {
        setLoading(true);
        const data = await getSantriForBulk(filters);
        setSantriList(data);
        setLoading(false);
        // Reset selection when data changes to avoid ghost selection
        setSelectedIds([]);
    };

    const handleToggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(x => x !== id));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(santriList.map(s => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleAssign = async () => {
        if (selectedIds.length === 0) return;
        if (!targetId) {
            alert("Pilih target Kelas/Halaqoh dulu");
            return;
        }

        if (!confirm(`Yakin memindahkan ${selectedIds.length} santri ini?`)) return;

        setProcessing(true);
        const result = await bulkUpdateSantri(selectedIds, assignType, targetId);
        setProcessing(false);

        if (result.error) {
            alert(result.error);
        } else {
            alert("Berhasil update data!");
            loadSantri(); // Refresh
            setTargetId("");
            setSelectedIds([]);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Bulk Assign Santri</h1>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-1">
                            <Label className="text-xs">Status</Label>
                            <select
                                className="border rounded p-2 text-sm w-32"
                                value={filters.status || ""}
                                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                            >
                                <option value="">Semua</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Non-Aktif</option>
                                <option value="lulus">Lulus</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Jenjang</Label>
                            <select
                                className="border rounded p-2 text-sm w-32"
                                value={filters.jenjang || ""}
                                onChange={e => setFilters(prev => ({ ...prev, jenjang: e.target.value || undefined }))}
                            >
                                <option value="">Semua</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                                <option value="SMK">SMK</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Jenis Kelamin</Label>
                            <select
                                className="border rounded p-2 text-sm w-32"
                                value={filters.jenis_kelamin || ""}
                                onChange={e => setFilters(prev => ({ ...prev, jenis_kelamin: e.target.value || undefined }))}
                            >
                                <option value="">Semua</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 py-2 bg-gray-50 px-3 rounded border">
                            <Label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={filters.noKelas || false}
                                    onChange={(e) => setFilters(prev => ({ ...prev, noKelas: e.target.checked }))}
                                />
                                Belum punya Kelas
                            </Label>
                            <Label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={filters.noHalaqoh || false}
                                    onChange={(e) => setFilters(prev => ({ ...prev, noHalaqoh: e.target.checked }))}
                                />
                                Belum punya Halaqoh
                            </Label>
                        </div>
                        {(filters.noKelas || filters.noHalaqoh || filters.jenis_kelamin) && (
                            <Button variant="ghost" size="sm" onClick={() => setFilters({ status: "aktif" })}>
                                <X className="w-3 h-3 mr-1" /> Reset Filter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Bar (Sticky if selected > 0) */}
            {selectedIds.length > 0 && (
                <div className="sticky top-4 z-10 bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                            {selectedIds.length} Selected
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Assign to:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-1 max-w-2xl">
                        <select
                            className="border rounded p-2 text-sm w-32"
                            value={assignType}
                            onChange={(e) => {
                                setAssignType(e.target.value as any);
                                setTargetId(""); // Reset target when type changes
                            }}
                        >
                            <option value="kelas">Kelas</option>
                            <option value="halaqoh">Halaqoh</option>
                        </select>

                        <select
                            className="border rounded p-2 text-sm flex-1"
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                        >
                            <option value="">-- Pilih {assignType === "kelas" ? "Kelas" : "Halaqoh"} --</option>
                            <option value="null">-- Kosongkan (Unassign) --</option>
                            {assignType === "kelas" ? (
                                kelasList.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama} (Tingkat {k.tingkat})</option>
                                ))
                            ) : (
                                halaqohList.map(h => (
                                    <option key={h.id} value={h.id}>{h.nama}</option>
                                ))
                            )}
                        </select>

                        <Button onClick={handleAssign} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            Process
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        checked={santriList.length > 0 && selectedIds.length === santriList.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableHead>
                                <TableHead>Nama Santri</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead>Kelas Saat Ini</TableHead>
                                <TableHead>Halaqoh Saat Ini</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : santriList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        Tidak ada data yang cocok dengan filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                santriList.map((s) => (
                                    <TableRow key={s.id} className={selectedIds.includes(s.id) ? "bg-blue-50 dark:bg-blue-900/30" : ""}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                checked={selectedIds.includes(s.id)}
                                                onChange={(e) => handleToggleSelect(s.id, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{s.nama}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{s.nis}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={s.jenjang === "SMP" ? "secondary" : "default"} className="text-xs">
                                                {s.jenjang}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {s.kelas ? (
                                                <Badge variant="outline">{s.kelas.nama}</Badge>
                                            ) : (
                                                <span className="text-red-400 text-xs italic">Belum Ada</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {s.halaqoh ? (
                                                <Badge variant="outline">{s.halaqoh.nama}</Badge>
                                            ) : (
                                                <span className="text-red-400 text-xs italic">Belum Ada</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full ${s.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {s.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
