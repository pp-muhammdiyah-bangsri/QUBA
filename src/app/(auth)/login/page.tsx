"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserPlus, ArrowRight, BookOpen, Quote, Star, Verified, CheckCircle2, ChevronRight, User, KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const DUMMY_DOMAIN = "@quba.app";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convert username to dummy email for Supabase Auth
        const email = username.includes("@") ? username : `${username}${DUMMY_DOMAIN}`;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Translate common errors to Indonesian
            if (error.message.includes("Invalid login credentials")) {
                setError("Username atau Password salah.");
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            window.location.href = "/";
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Values & Information */}
            <div className="hidden lg:flex flex-col relative bg-emerald-950 text-white overflow-hidden h-screen">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-950/95 to-teal-950/90 z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590076215667-875d4ef2d743?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0" />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex-1 flex flex-col p-6 lg:p-8 justify-between">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-lg shrink-0">
                            <span className="text-2xl font-bold">Q</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg lg:text-xl tracking-tight leading-tight">Pondok Pesantren <br /> Muhammadiyah Bangsri</h1>
                            <p className="text-xs text-emerald-200/90 font-medium mt-0.5">MBS QUBA & LKSA Mustadl'afin</p>
                        </div>
                    </div>

                    {/* Content - Visi & Misi */}
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm text-emerald-300 text-xs font-medium">
                                <Star className="w-3 h-3 fill-emerald-300" />
                                <span>Motto Kami</span>
                            </div>
                            <div className="relative py-1">
                                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white mb-4">
                                    <span className="block mb-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">Pinter Ngaji,</span>
                                    <span className="block mb-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-emerald-200 italic decoration-emerald-500/30 underline-offset-8">Akhlak Terpuji,</span>
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Berprestasi.</span>
                                </h2>
                                <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-transparent rounded-full opacity-80"></div>
                            </div>
                        </div>

                        {/* Visi Cards */}
                        <div className="grid gap-3">
                            <div className="bg-white/5 backdrop-blur-sm border border-emerald-500/10 hover:bg-white/10 transition-colors p-4 rounded-xl group cursor-default">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform shrink-0">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base mb-1 group-hover:text-emerald-300 transition-colors">Visi Pesantren</h3>
                                        <ul className="space-y-1 text-xs text-emerald-100/70 leading-relaxed list-disc list-outside pl-4">
                                            <li>Menjadi institusi pendidikan dan perkaderan yang amanah, mandiri, dan berpengaruh pada terbangunnya peradaban dunia yang Islami.</li>
                                            <li>Membentuk kader umat, kader persyarikatan Muhammadiyah, dan kader bangsa yang kuat, berilmu, dan kokoh berpegang pada Al-Qur’an dan Sunnah.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm border border-emerald-500/10 hover:bg-white/10 transition-colors p-4 rounded-xl group cursor-default">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform shrink-0">
                                        <Verified className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base mb-1 group-hover:text-teal-300 transition-colors">Misi Utama</h3>
                                        <ul className="space-y-1 text-xs text-emerald-100/70 leading-relaxed list-disc list-outside pl-4">
                                            <li>Menyelenggarakan pendidikan yang unggul dan berkualitas.</li>
                                            <li>Membangun jaringan kerjasama sinergis untuk membangun peradaban masyarakat yang Islami.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Quote */}
                    <div className="mt-6">
                        <div className="relative pl-4 border-l-2 border-emerald-500/30">
                            <p className="text-emerald-200/80 italic font-medium text-sm">
                                "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
                            </p>
                            <p className="text-xs text-emerald-400 mt-1 font-semibold">— HR. Bukhari</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Actions (Scrollable) */}
            <div className="flex flex-col h-screen overflow-y-auto relative bg-background">
                <div className="m-auto w-full max-w-[520px] p-6 lg:p-8 space-y-8 py-12">

                    {/* Mobile Logo Only */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-2xl font-bold text-white">Q</span>
                        </div>
                    </div>

                    {/* 1. PSB Highlight Section */}
                    <Card className="border-none shadow-2xl relative overflow-hidden group bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                        <CardContent className="p-0 relative z-10">
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white mb-2 shadow-sm">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                        </span>
                                        Pendaftaran Dibuka
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                                        Penerimaan Santri Baru
                                    </h2>
                                    <p className="text-emerald-50 text-base leading-relaxed opacity-90">
                                        MBS QUBA & LKSA Mustadl'afin Tahun Ajaran 2026/2027.
                                        Bergabunglah menjadi bagian dari generasi Qur'ani.
                                    </p>
                                </div>



                                <Link href="/psb" className="block">
                                    <Button size="lg" className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-bold h-12 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] border-0">
                                        Daftar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-background px-4 text-muted-foreground font-medium">Bagi Admin & Wali Santri</span>
                        </div>
                    </div>

                    {/* 2. Login Section */}
                    <div className="space-y-6">
                        <div className="text-center lg:text-left">
                            <h3 className="text-xl font-bold text-foreground">Masuk Aplikasi</h3>
                            <p className="text-sm text-muted-foreground">Silakan login untuk mengakses dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="font-bold text-xs">!</span>
                                    </div>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium">NIS / Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Masukkan nomor induk"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            autoComplete="username"
                                            className="pl-10 h-12 bg-muted/30 hover:bg-muted/50 transition-colors border-input/60 focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
                                        >
                                            Lupa password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            autoComplete="current-password"
                                            className="pl-10 h-12 bg-muted/30 hover:bg-muted/50 transition-colors border-input/60 focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="pt-0 text-center">
                        <p className="text-xs text-muted-foreground/60">
                            &copy; {new Date().getFullYear()} Pondok Pesantren Muhammadiyah Bangsri. <br />
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}
