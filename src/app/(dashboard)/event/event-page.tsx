"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Calendar, Megaphone, MapPin, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
    createEvent,
    updateEvent,
    deleteEvent,
    createInformasi,
    updateInformasi,
    deleteInformasi,
    toggleInformasiPin,
    EventFormData,
    InformasiFormData,
} from "./actions";

interface Event {
    id: string;
    judul: string;
    deskripsi: string | null;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    lokasi: string | null;
    jenis: string;
    is_active: boolean;
    created_at: string;
}

interface Informasi {
    id: string;
    judul: string;
    konten: string;
    kategori: string;
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
}

interface EventPageProps {
    initialEvents: Event[];
    initialInformasi: Informasi[];
    userRole?: string;
}

const jenisColors: Record<string, string> = {
    umum: "bg-gray-100 text-gray-800",
    akademik: "bg-blue-100 text-blue-800",
    keagamaan: "bg-green-100 text-green-800",
    sosial: "bg-purple-100 text-purple-800",
};

const kategoriColors: Record<string, string> = {
    pengumuman: "bg-red-100 text-red-800",
    berita: "bg-blue-100 text-blue-800",
    info: "bg-gray-100 text-gray-800",
};

export function EventPage({ initialEvents, initialInformasi, userRole = "admin" }: EventPageProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [informasiList, setInformasiList] = useState<Informasi[]>(initialInformasi);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("events");

    // Event Dialog State
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [eventForm, setEventForm] = useState<EventFormData>({
        judul: "",
        deskripsi: "",
        tanggal_mulai: new Date().toISOString().split("T")[0],
        tanggal_selesai: "",
        lokasi: "",
        jenis: "umum",
        is_active: true,
    });

    // Informasi Dialog State
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [editingInfo, setEditingInfo] = useState<Informasi | null>(null);
    const [infoForm, setInfoForm] = useState<InformasiFormData>({
        judul: "",
        konten: "",
        kategori: "pengumuman",
        is_pinned: false,
        is_active: true,
    });

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ type: "event" | "info"; item: Event | Informasi } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtered data
    const filteredEvents = events.filter((e) =>
        e.judul.toLowerCase().includes(search.toLowerCase())
    );
    const filteredInfo = informasiList.filter((i) =>
        i.judul.toLowerCase().includes(search.toLowerCase())
    );

    // Event handlers
    const handleOpenAddEvent = () => {
        setEditingEvent(null);
        setEventForm({
            judul: "",
            deskripsi: "",
            tanggal_mulai: new Date().toISOString().split("T")[0],
            tanggal_selesai: "",
            lokasi: "",
            jenis: "umum",
            is_active: true,
        });
        setError(null);
        setIsEventDialogOpen(true);
    };

    const handleOpenEditEvent = (event: Event) => {
        setEditingEvent(event);
        setEventForm({
            judul: event.judul,
            deskripsi: event.deskripsi || "",
            tanggal_mulai: event.tanggal_mulai,
            tanggal_selesai: event.tanggal_selesai || "",
            lokasi: event.lokasi || "",
            jenis: event.jenis as "umum" | "akademik" | "keagamaan" | "sosial",
            is_active: event.is_active,
        });
        setError(null);
        setIsEventDialogOpen(true);
    };

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingEvent) {
                const result = await updateEvent(editingEvent.id, eventForm);
                if (result.error) setError(result.error);
                else window.location.reload();
            } else {
                const result = await createEvent(eventForm);
                if (result.error) setError(result.error);
                else window.location.reload();
            }
        } catch {
            setError("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    // Informasi handlers
    const handleOpenAddInfo = () => {
        setEditingInfo(null);
        setInfoForm({
            judul: "",
            konten: "",
            kategori: "pengumuman",
            is_pinned: false,
            is_active: true,
        });
        setError(null);
        setIsInfoDialogOpen(true);
    };

    const handleOpenEditInfo = (info: Informasi) => {
        setEditingInfo(info);
        setInfoForm({
            judul: info.judul,
            konten: info.konten,
            kategori: info.kategori as "pengumuman" | "berita" | "info",
            is_pinned: info.is_pinned,
            is_active: info.is_active,
        });
        setError(null);
        setIsInfoDialogOpen(true);
    };

    const handleSubmitInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingInfo) {
                const result = await updateInformasi(editingInfo.id, infoForm);
                if (result.error) setError(result.error);
                else window.location.reload();
            } else {
                const result = await createInformasi(infoForm);
                if (result.error) setError(result.error);
                else window.location.reload();
            }
        } catch {
            setError("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePin = async (info: Informasi) => {
        await toggleInformasiPin(info.id, !info.is_pinned);
        setInformasiList((prev) =>
            prev.map((i) => (i.id === info.id ? { ...i, is_pinned: !i.is_pinned } : i))
        );
    };

    // Delete handlers
    const handleOpenDelete = (type: "event" | "info", item: Event | Informasi) => {
        setDeletingItem({ type, item });
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setLoading(true);

        try {
            if (deletingItem.type === "event") {
                const result = await deleteEvent(deletingItem.item.id);
                if (result.error) setError(result.error);
                else setEvents((prev) => prev.filter((e) => e.id !== deletingItem.item.id));
            } else {
                const result = await deleteInformasi(deletingItem.item.id);
                if (result.error) setError(result.error);
                else setInformasiList((prev) => prev.filter((i) => i.id !== deletingItem.item.id));
            }
            setIsDeleteDialogOpen(false);
        } catch {
            setError("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-700">{events.length}</div>
                                <div className="text-sm text-blue-600">Total Event</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-700">{informasiList.length}</div>
                                <div className="text-sm text-purple-600">Total Informasi</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-700">
                                    {events.filter((e) => e.is_active).length}
                                </div>
                                <div className="text-sm text-green-600">Event Aktif</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center">
                                <Pin className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-700">
                                    {informasiList.filter((i) => i.is_pinned).length}
                                </div>
                                <div className="text-sm text-orange-600">Info Disematkan</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                            <TabsList>
                                <TabsTrigger value="events">Event</TabsTrigger>
                                <TabsTrigger value="informasi">Informasi</TabsTrigger>
                            </TabsList>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {userRole !== "ortu" ? (
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Cari..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                ) : <div></div>}
                                {userRole !== "ortu" && (
                                    <Button onClick={activeTab === "events" ? handleOpenAddEvent : handleOpenAddInfo} className="w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah {activeTab === "events" ? "Event" : "Informasi"}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <TabsContent value="events">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                Belum ada event
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEvents.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell>
                                                    <div className="font-medium">{event.judul}</div>
                                                    {event.deskripsi && (
                                                        <div className="text-xs text-gray-500 line-clamp-1">{event.deskripsi}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={jenisColors[event.jenis]}>
                                                        {event.jenis.charAt(0).toUpperCase() + event.jenis.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(event.tanggal_mulai).toLocaleDateString("id-ID")}
                                                    {event.tanggal_selesai && ` - ${new Date(event.tanggal_selesai).toLocaleDateString("id-ID")}`}
                                                </TableCell>
                                                <TableCell>
                                                    {event.lokasi && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.lokasi}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={event.is_active ? "success" : "secondary"}>
                                                        {event.is_active ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {userRole !== "ortu" && (
                                                        <>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditEvent(event)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete("event", event)}>
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="informasi">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judul</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInfo.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                                <Megaphone className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                Belum ada informasi
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInfo.map((info) => (
                                            <TableRow key={info.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {info.is_pinned && <Pin className="w-4 h-4 text-orange-500" />}
                                                        <div>
                                                            <div className="font-medium">{info.judul}</div>
                                                            <div className="text-xs text-gray-500 line-clamp-1">{info.konten}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={kategoriColors[info.kategori]}>
                                                        {info.kategori.charAt(0).toUpperCase() + info.kategori.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(info.created_at).toLocaleDateString("id-ID")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={info.is_active ? "success" : "secondary"}>
                                                        {info.is_active ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {userRole !== "ortu" && (
                                                        <>
                                                            <Button variant="ghost" size="icon" onClick={() => handleTogglePin(info)}>
                                                                {info.is_pinned ? <PinOff className="w-4 h-4 text-orange-500" /> : <Pin className="w-4 h-4" />}
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditInfo(info)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDelete("info", info)}>
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Event Dialog */}
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogContent onClose={() => setIsEventDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Edit Event" : "Tambah Event Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEvent}>
                        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Judul *</Label>
                                <Input value={eventForm.judul} onChange={(e) => setEventForm({ ...eventForm, judul: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Jenis *</Label>
                                    <Select value={eventForm.jenis} onChange={(e) => setEventForm({ ...eventForm, jenis: e.target.value as EventFormData["jenis"] })}>
                                        <option value="umum">Umum</option>
                                        <option value="akademik">Akademik</option>
                                        <option value="keagamaan">Keagamaan</option>
                                        <option value="sosial">Sosial</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Lokasi</Label>
                                    <Input value={eventForm.lokasi} onChange={(e) => setEventForm({ ...eventForm, lokasi: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Mulai *</Label>
                                    <Input type="date" value={eventForm.tanggal_mulai} onChange={(e) => setEventForm({ ...eventForm, tanggal_mulai: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Selesai</Label>
                                    <Input type="date" value={eventForm.tanggal_selesai} onChange={(e) => setEventForm({ ...eventForm, tanggal_selesai: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <Textarea value={eventForm.deskripsi} onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })} rows={3} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Informasi Dialog */}
            <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
                <DialogContent onClose={() => setIsInfoDialogOpen(false)} className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingInfo ? "Edit Informasi" : "Tambah Informasi Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitInfo}>
                        {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Judul *</Label>
                                <Input value={infoForm.judul} onChange={(e) => setInfoForm({ ...infoForm, judul: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Kategori *</Label>
                                <Select value={infoForm.kategori} onChange={(e) => setInfoForm({ ...infoForm, kategori: e.target.value as InformasiFormData["kategori"] })}>
                                    <option value="pengumuman">Pengumuman</option>
                                    <option value="berita">Berita</option>
                                    <option value="info">Info</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Konten *</Label>
                                <Textarea value={infoForm.konten} onChange={(e) => setInfoForm({ ...infoForm, konten: e.target.value })} rows={5} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsInfoDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Hapus {deletingItem?.type === "event" ? "Event" : "Informasi"}</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600 dark:text-gray-400">
                        Apakah Anda yakin ingin menghapus <strong>{(deletingItem?.item as Event)?.judul}</strong>?
                    </p>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
