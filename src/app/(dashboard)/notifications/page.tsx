"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Send, Loader2, CheckCircle } from "lucide-react";
import { broadcastNotification } from "./actions";

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [targetRole, setTargetRole] = useState<string>("all");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

    const handleSend = async () => {
        if (!title || !body) return;

        setLoading(true);
        setResult(null);

        const res = await broadcastNotification(
            title,
            body,
            targetRole === "all" ? undefined : targetRole
        );

        setResult(res);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Push Notifications</h1>
                <p className="text-gray-500">Kirim notifikasi ke pengguna aplikasi</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Kirim Notifikasi
                        </CardTitle>
                        <CardDescription>
                            Broadcast notifikasi ke semua user atau grup tertentu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                placeholder="Pengumuman Penting"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="body">Isi Pesan</Label>
                            <Textarea
                                id="body"
                                placeholder="Isi notifikasi..."
                                rows={3}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Target Penerima</Label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white"
                            >
                                <option value="all">Semua User</option>
                                <option value="admin">Admin</option>
                                <option value="ustadz">Ustadz</option>
                                <option value="ortu">Orang Tua</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleSend}
                            disabled={loading || !title || !body}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Kirim Notifikasi
                                </>
                            )}
                        </Button>

                        {result && (
                            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Notifikasi Terkirim</span>
                                </div>
                                <p className="text-sm text-emerald-600 mt-1">
                                    Berhasil: {result.sent} / {result.total}
                                    {result.failed > 0 && ` (Gagal: ${result.failed})`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Panduan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Cara Kerja</h4>
                            <p>Notifikasi akan dikirim ke semua user yang telah mengaktifkan notifikasi di browser/HP mereka.</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Tips</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Gunakan judul yang jelas dan ringkas</li>
                                <li>Isi pesan maksimal 2-3 kalimat</li>
                                <li>Kirim hanya untuk hal penting</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Konfigurasi</h4>
                            <p className="text-amber-600">
                                Pastikan VAPID keys sudah dikonfigurasi di <code>.env.local</code>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
