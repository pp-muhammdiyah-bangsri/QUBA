"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Check, AlertCircle } from "lucide-react";

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validation
        if (newPassword !== confirmPassword) {
            setError("Password baru dan konfirmasi tidak cocok.");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password baru minimal 6 karakter.");
            setLoading(false);
            return;
        }

        // Update Password using Supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Ganti Password</h1>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5" />
                        Ubah Password Akun
                    </CardTitle>
                    <CardDescription>
                        Pastikan password baru Anda aman dan mudah diingat.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Password berhasil diubah!
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Password Baru</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Ketik ulang password baru"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Password Baru"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
