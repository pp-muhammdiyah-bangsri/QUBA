"use client";

import { useEffect, useState } from "react";
import { updateAsatidzProfile, getMyAsatidzProfile } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, Loader2, Camera } from "lucide-react";
import { PhotoUpload } from "@/components/photo-upload";

interface UstadzProfile {
    id: string;
    nama: string;
    alamat: string | null;
    kontak: string | null;
    biografi: string | null;
    pendidikan: string | null;
    keahlian: string | null;
    foto_url: string | null;
}

export default function EditProfilePage() {
    const [profile, setProfile] = useState<UstadzProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await getMyAsatidzProfile();
        if (data) {
            setProfile(data as UstadzProfile);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);

        // Use server action with admin client
        const result = await updateAsatidzProfile(profile.id, {
            nama: profile.nama,
            biografi: profile.biografi || "",
            pendidikan: profile.pendidikan || "",
            keahlian: profile.keahlian || "",
            kontak: profile.kontak || "",
            alamat: profile.alamat || "",
            foto_url: profile.foto_url || "",
        });

        if (result.error) {
            setMessage({ type: "error", text: "Gagal menyimpan: " + result.error });
        } else {
            setMessage({ type: "success", text: "Profil berhasil disimpan!" });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12 text-gray-500">
                Profil Ustadz tidak ditemukan. Hubungi Admin.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit Profil Saya</h1>

            <form onSubmit={handleSave}>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informasi Dasar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Photo Upload Section */}
                            <div className="flex flex-col items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                                <Label className="mb-3 flex items-center gap-2">
                                    <Camera className="w-4 h-4" />
                                    Foto Profil
                                </Label>
                                <PhotoUpload
                                    currentUrl={profile.foto_url}
                                    onUpload={(url) => setProfile({ ...profile, foto_url: url || null })}
                                    folder="asatidz"
                                />
                            </div>
                            <div>
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={profile.nama}
                                    onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                                    placeholder="Nama lengkap"
                                />
                            </div>
                            <div>
                                <Label>No HP / WhatsApp</Label>
                                <Input
                                    placeholder="08xxx"
                                    value={profile.kontak || ""}
                                    onChange={(e) => setProfile({ ...profile, kontak: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Alamat</Label>
                                <Textarea
                                    placeholder="Alamat domisili"
                                    value={profile.alamat || ""}
                                    onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Biografi & Keahlian</CardTitle>
                            <CardDescription>
                                Informasi ini akan ditampilkan ke Wali Santri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Biografi Singkat</Label>
                                <Textarea
                                    placeholder="Ceritakan tentang diri Anda..."
                                    rows={4}
                                    value={profile.biografi || ""}
                                    onChange={(e) => setProfile({ ...profile, biografi: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Riwayat Pendidikan</Label>
                                <Textarea
                                    placeholder="S1 Al-Azhar Mesir, Pondok Gontor..."
                                    value={profile.pendidikan || ""}
                                    onChange={(e) => setProfile({ ...profile, pendidikan: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Bidang Keahlian</Label>
                                <Input
                                    placeholder="Tahfidz, Bahasa Arab, Fiqih..."
                                    value={profile.keahlian || ""}
                                    onChange={(e) => setProfile({ ...profile, keahlian: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="mt-6">
                    <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </div>
    );
}
