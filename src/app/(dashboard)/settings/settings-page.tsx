"use client";

import { useState } from "react";
import { User, Mail, KeyRound, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { updateEmail, updatePassword, updateDisplayName } from "./actions";

interface SettingsPageProps {
    initialProfile: {
        email: string | undefined;
        fullName: string;
        role: string;
    };
}

const roleLabels: Record<string, string> = {
    admin: "Administrator",
    ustadz: "Ustadz/Ustadzah",
    ortu: "Orang Tua",
};

export function SettingsPage({ initialProfile }: SettingsPageProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    // Display name form
    const [fullName, setFullName] = useState(initialProfile.fullName);

    // Email form
    const [newEmail, setNewEmail] = useState("");

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            showToast("error", "Nama tidak boleh kosong");
            return;
        }

        setLoading("name");
        const result = await updateDisplayName(fullName.trim());
        setLoading(null);

        if (result.error) {
            showToast("error", result.error);
        } else {
            showToast("success", result.message!);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.trim()) {
            showToast("error", "Email tidak boleh kosong");
            return;
        }

        setLoading("email");
        const result = await updateEmail(newEmail.trim());
        setLoading(null);

        if (result.error) {
            showToast("error", result.error);
        } else {
            showToast("success", result.message!);
            setNewEmail("");
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("error", "Semua field harus diisi");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("error", "Password baru tidak cocok dengan konfirmasi");
            return;
        }

        if (newPassword.length < 6) {
            showToast("error", "Password minimal 6 karakter");
            return;
        }

        setLoading("password");
        const result = await updatePassword(currentPassword, newPassword);
        setLoading(null);

        if (result.error) {
            showToast("error", result.error);
        } else {
            showToast("success", result.message!);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Akun</h1>
                <p className="text-muted-foreground mt-1">Kelola informasi profil dan keamanan akun Anda</p>
            </div>

            {/* Profile Info Card */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informasi Profil
                    </CardTitle>
                    <CardDescription>Perbarui nama tampilan Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{initialProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-muted-foreground">Role:</span>
                            <Badge variant="secondary">{roleLabels[initialProfile.role] || initialProfile.role}</Badge>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateName} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nama Lengkap</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <Button type="submit" disabled={loading === "name"}>
                            {loading === "name" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Simpan Nama
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Email Card */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Ubah Email
                    </CardTitle>
                    <CardDescription>
                        Email konfirmasi akan dikirim ke alamat email baru
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newEmail">Email Baru</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email.baru@example.com"
                            />
                        </div>
                        <Button type="submit" disabled={loading === "email"}>
                            {loading === "email" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Mail className="w-4 h-4 mr-2" />
                            )}
                            Kirim Konfirmasi
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5" />
                        Ubah Password
                    </CardTitle>
                    <CardDescription>
                        Pastikan password baru minimal 6 karakter
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Password Saat Ini</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Password Baru</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading === "password"}>
                            {loading === "password" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <KeyRound className="w-4 h-4 mr-2" />
                            )}
                            Ubah Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
