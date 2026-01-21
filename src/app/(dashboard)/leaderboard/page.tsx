import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/app/(dashboard)/gamifikasi/actions";
import { LeaderboardCard } from "@/components/gamifikasi/leaderboard-card";
import { Trophy } from "lucide-react";

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
    // SMA/SMK combined - need to fetch both and merge
    const leaderboardSMA = await getLeaderboard(10, "SMA/SMK");

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
