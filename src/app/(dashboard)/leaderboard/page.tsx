import { createClient } from "@/lib/supabase/server";
import { getLeaderboard, getSantriRank } from "@/app/(dashboard)/gamifikasi/actions";
import { LeaderboardCard } from "@/components/gamifikasi/leaderboard-card";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, User } from "lucide-react";

export const metadata = {
    title: "Leaderboard | QUBA",
};

export default async function LeaderboardPage() {
    const supabase = await createClient();

    // Get current user's linked santri (for ortu)
    const { data: { user } } = await supabase.auth.getUser();
    let linkedSantriId: string | undefined;

    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("linked_santri_id")
            .eq("id", user.id)
            .single();
        linkedSantriId = profile?.linked_santri_id || undefined;
    }

    // Get leaderboard data
    const leaderboardAll = await getLeaderboard(10);
    const leaderboardSMP = await getLeaderboard(10, "SMP");
    // SMA/SMK combined
    const leaderboardSMA = await getLeaderboard(10, "SMA/SMK");

    // Check if child is in top 10, if not get their rank
    const childInTop10 = linkedSantriId
        ? leaderboardAll.some(entry => entry.id === linkedSantriId)
        : false;

    const childRank = (linkedSantriId && !childInTop10)
        ? await getSantriRank(linkedSantriId)
        : null;

    const levelNames: Record<number, string> = {
        1: "Mubtadi'",
        2: "Mutawassith",
        3: "Mutaqaddim",
        4: "Hafidz Muda",
        5: "Hafidz",
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                        <Trophy className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    Leaderboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Peringkat santri berdasarkan pencapaian dan poin gamifikasi.
                </p>
            </div>

            {/* Child rank card - shown only if child is NOT in top 10 */}
            {childRank && (
                <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-foreground">Posisi Anak Anda</h3>
                                <p className="text-sm text-muted-foreground">
                                    {childRank.nama} • {childRank.jenjang} • Lvl {childRank.level} ({levelNames[childRank.level] || ""})
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    #{childRank.rank}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {childRank.total_points.toLocaleString("id-ID")} poin
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Leaderboard */}
            <LeaderboardCard
                entries={leaderboardAll}
                title="🏆 Top 10 Semua Santri"
                currentSantriId={linkedSantriId}
            />

            {/* Per Jenjang */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaderboardCard
                    entries={leaderboardSMP}
                    title="📘 Top 10 SMP"
                    currentSantriId={linkedSantriId}
                />
                <LeaderboardCard
                    entries={leaderboardSMA}
                    title="📗 Top 10 SMA/SMK"
                    currentSantriId={linkedSantriId}
                />
            </div>
        </div>
    );
}
