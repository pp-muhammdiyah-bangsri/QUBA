import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    getBadges,
    getSantriBadges,
    getSantriPoints,
    getPointsHistory,
} from "@/app/(dashboard)/gamifikasi/actions";
import { BadgeCard } from "@/components/gamifikasi/badge-card";
import { LevelProgress } from "@/components/gamifikasi/level-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, History } from "lucide-react";

export const metadata = {
    title: "Pencapaian | QUBA",
};

export default async function AchievementsPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get profile and linked santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role, linked_santri_id")
        .eq("id", user.id)
        .single();

    // Only ortu can access this page with a linked santri
    if (!profile?.linked_santri_id) {
        return (
            <div className="flex items-center justify-center h-64">
                <Card className="border-0 shadow-md p-8 text-center bg-card">
                    <p className="text-muted-foreground">
                        Halaman ini hanya tersedia untuk orang tua dengan santri terhubung.
                    </p>
                </Card>
            </div>
        );
    }

    const santriId = profile.linked_santri_id;

    // Get santri info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // Fetch data
    const [allBadges, santriBadges, pointsData, pointsHistory] = await Promise.all([
        getBadges(),
        getSantriBadges(santriId),
        getSantriPoints(santriId),
        getPointsHistory(santriId, 10),
    ]);

    // Create a map of earned badges
    const earnedBadgeIds = new Set(santriBadges.map((sb) => sb.badge_id));
    const earnedBadgeMap = new Map(
        santriBadges.map((sb) => [sb.badge_id, sb.earned_at])
    );

    // Group badges by kategori and sort earned first
    const badgesByKategori = allBadges.reduce((acc, badge) => {
        if (!acc[badge.kategori]) {
            acc[badge.kategori] = [];
        }
        acc[badge.kategori].push(badge);
        return acc;
    }, {} as Record<string, typeof allBadges>);

    // Sort each category: earned badges first, then locked badges
    Object.keys(badgesByKategori).forEach((kategori) => {
        badgesByKategori[kategori].sort((a, b) => {
            const aEarned = earnedBadgeIds.has(a.id) ? 0 : 1;
            const bEarned = earnedBadgeIds.has(b.id) ? 0 : 1;
            if (aEarned !== bEarned) return aEarned - bEarned;
            // If both earned or both locked, sort by poin (higher first)
            return b.poin - a.poin;
        });
    });

    const kategoriLabels: Record<string, string> = {
        hafalan: "📖 Hafalan",
        presensi: "📅 Presensi",
        adab: "✨ Adab",
        khusus: "🎯 Khusus",
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                        <Award className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    Pencapaian
                </h1>
                <p className="text-muted-foreground mt-1">
                    Daftar pencapaian dan badge untuk <strong>{santri?.nama || "Santri"}</strong>
                </p>
            </div>

            {/* Level Progress */}
            <LevelProgress
                level={pointsData.level.level}
                levelName={pointsData.level.name}
                totalPoints={pointsData.totalPoints}
                progress={pointsData.level.progress}
                nextLevelPoints={pointsData.level.nextLevel}
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-900/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {santriBadges.length}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                            Badge Didapat
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {pointsData.totalPoints.toLocaleString("id-ID")}
                        </div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            Total Poin
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {allBadges.length}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            Total Badge
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {allBadges.length > 0 ? Math.round((santriBadges.length / allBadges.length) * 100) : 0}%
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                            Progress
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Badges by Category */}
            {Object.entries(badgesByKategori).map(([kategori, badges]) => (
                <div key={kategori}>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        {kategoriLabels[kategori] || kategori}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {badges.map((badge) => (
                            <BadgeCard
                                key={badge.id}
                                icon={badge.icon}
                                nama={badge.nama}
                                deskripsi={badge.deskripsi}
                                poin={badge.poin}
                                kategori={badge.kategori}
                                earnedAt={earnedBadgeMap.get(badge.id) || null}
                                isLocked={!earnedBadgeIds.has(badge.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Points History */}
            {pointsHistory.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Riwayat Poin
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {pointsHistory.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">{log.reason}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`font-bold ${log.amount > 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                            }`}
                                    >
                                        {log.amount > 0 ? "+" : ""}
                                        {log.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
