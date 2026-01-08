"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, Loader2, AlertCircle } from "lucide-react";

interface SantriProfile {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    alamat: string | null;
    nama_wali: string | null;
    kontak_wali: string | null;
}

export default function EditSantriProfilePage() {
    const [profile, setProfile] = useState<SantriProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get linked santri from profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userProfile } = await (supabase as any)
            .from("profiles")
            .select("linked_santri_id")
            .eq("id", user.id)
            .single();

        if (!userProfile?.linked_santri_id) {
            setLoading(false);
            return;
        }

        // Get santri data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from("santri")
            .select("id, nama, nis, jenjang, alamat, nama_wali, kontak_wali")
            .eq("id", userProfile.linked_santri_id)
            .single();

        if (data) {
            setProfile(data as SantriProfile);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("santri")
            .update({
                alamat: profile.alamat,
                nama_wali: profile.nama_wali,
                kontak_wali: profile.kontak_wali,
            })
            .eq("id", profile.id);

        if (error) {
            setMessage({ type: "error", text: "Gagal menyimpan: " + error.message });
        } else {
            setMessage({ type: "success", text: "Data berhasil diperbarui!" });
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
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Data Santri Tidak Ditemukan</h2>
                <p className="text-gray-500 dark:text-gray-400">Akun Anda belum terhubung dengan data santri. Hubungi Admin.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Profil Data Santri</h1>

            <form onSubmit={handleSave}>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Read-Only Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Identitas Santri
                            </CardTitle>
                            <CardDescription>
                                Data ini hanya bisa diubah oleh Admin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Nama Lengkap</Label>
                                <Input value={profile.nama} disabled className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <div>
                                <Label>NIS</Label>
                                <Input value={profile.nis} disabled className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <div>
                                <Label>Jenjang</Label>
                                <Input value={profile.jenjang} disabled className="bg-gray-100 dark:bg-gray-800" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editable Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Wali & Alamat</CardTitle>
                            <CardDescription>
                                Anda bisa memperbarui informasi kontak di bawah ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Nama Wali</Label>
                                <Input
                                    placeholder="Nama Orang Tua/Wali"
                                    value={profile.nama_wali || ""}
                                    onChange={(e) => setProfile({ ...profile, nama_wali: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>No HP / WhatsApp Wali</Label>
                                <Input
                                    placeholder="08xxx"
                                    value={profile.kontak_wali || ""}
                                    onChange={(e) => setProfile({ ...profile, kontak_wali: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Alamat Domisili</Label>
                                <Textarea
                                    placeholder="Alamat lengkap rumah"
                                    value={profile.alamat || ""}
                                    onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${message.type === "success"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
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
