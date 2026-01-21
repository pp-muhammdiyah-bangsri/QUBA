"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateLevel } from "@/lib/gamification";

// Types
export interface Badge {
    id: string;
    code: string;
    nama: string;
    deskripsi: string | null;
    icon: string;
    kategori: "hafalan" | "presensi" | "adab" | "khusus";
    poin: number;
    syarat: { type: string; value: number } | null;
}

export interface SantriBadge {
    id: string;
    santri_id: string;
    badge_id: string;
    earned_at: string;
    badge?: Badge;
}

export interface PointsLog {
    id: string;
    santri_id: string;
    amount: number;
    reason: string;
    badge_id: string | null;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    nama: string;
    jenjang: string;
    total_points: number;
    level: number;
    badge_count: number;
}

// Get all badges
export async function getBadges(): Promise<Badge[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("badges")
        .select("*")
        .order("kategori")
        .order("poin");

    if (error) {
        console.error("Error fetching badges:", error);
        return [];
    }

    return data || [];
}

// Get santri badges
export async function getSantriBadges(santriId: string): Promise<SantriBadge[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("santri_badges")
        .select("*, badge:badge_id(*)")
        .eq("santri_id", santriId)
        .order("earned_at", { ascending: false });

    if (error) {
        console.error("Error fetching santri badges:", error);
        return [];
    }

    return data || [];
}

// Get santri points and level  
export async function getSantriPoints(santriId: string): Promise<{ totalPoints: number; level: { level: number; name: string; progress: number; nextLevel: number | null } }> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("santri")
        .select("total_points")
        .eq("id", santriId)
        .single();

    if (error) {
        console.error("Error fetching santri points:", error);
        return { totalPoints: 0, level: calculateLevel(0) };
    }

    const totalPoints = data?.total_points || 0;
    return { totalPoints, level: calculateLevel(totalPoints) };
}

// Get points history
export async function getPointsHistory(santriId: string, limit = 10): Promise<PointsLog[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("points_log")
        .select("*")
        .eq("santri_id", santriId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching points history:", error);
        return [];
    }

    return data || [];
}

// Get leaderboard - uses public data only (nama, jenjang, points)
export async function getLeaderboard(limit = 10, jenjang?: string): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();

    // For leaderboard, we need to bypass RLS to get all santri
    // Since we're only selecting public data (nama, jenjang, points), this is safe
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("santri")
        .select("id, nama, jenjang, total_points, level")
        .eq("status", "aktif")
        .not("total_points", "is", null)
        .order("total_points", { ascending: false })
        .limit(limit);

    if (jenjang && jenjang !== "all") {
        // Handle SMA/SMK combined category
        if (jenjang === "SMA/SMK") {
            query = query.in("jenjang", ["SMA", "SMK"]);
        } else {
            query = query.eq("jenjang", jenjang);
        }
    }

    const { data: santriData, error: santriError } = await query;

    if (santriError) {
        console.error("Error fetching leaderboard:", santriError);
        // Fallback: return empty array if RLS blocks access
        return [];
    }

    // If no data (due to RLS), try different approach
    if (!santriData || santriData.length === 0) {
        // Return empty with message that leaderboard requires admin view
        return [];
    }

    // Get badge counts for each santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const santriIds = (santriData || []).map((s: any) => s.id);

    if (santriIds.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: badgeCounts } = await (supabase as any)
        .from("santri_badges")
        .select("santri_id")
        .in("santri_id", santriIds);

    const badgeCountMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (badgeCounts || []).forEach((b: any) => {
        badgeCountMap.set(b.santri_id, (badgeCountMap.get(b.santri_id) || 0) + 1);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (santriData || []).map((s: any) => ({
        id: s.id,
        nama: s.nama,
        jenjang: s.jenjang,
        total_points: s.total_points || 0,
        level: s.level || 1,
        badge_count: badgeCountMap.get(s.id) || 0,
    }));
}

// Award badge to santri
export async function awardBadge(santriId: string, badgeCode: string): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();

    // Get badge info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: badge, error: badgeError } = await (supabase as any)
        .from("badges")
        .select("*")
        .eq("code", badgeCode)
        .single();

    if (badgeError || !badge) {
        return { success: false, message: "Badge tidak ditemukan" };
    }

    // Check if already has badge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
        .from("santri_badges")
        .select("id")
        .eq("santri_id", santriId)
        .eq("badge_id", badge.id)
        .single();

    if (existing) {
        return { success: false, message: "Badge sudah dimiliki" };
    }

    // Award badge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: awardError } = await (supabase as any)
        .from("santri_badges")
        .insert({ santri_id: santriId, badge_id: badge.id });

    if (awardError) {
        return { success: false, message: "Gagal memberikan badge" };
    }

    // Add points
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("points_log").insert({
        santri_id: santriId,
        amount: badge.poin,
        reason: `Badge: ${badge.nama}`,
        badge_id: badge.id,
    });

    // Update total points and level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("total_points")
        .eq("id", santriId)
        .single();

    const newPoints = (santri?.total_points || 0) + badge.poin;
    const newLevel = calculateLevel(newPoints).level;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("santri")
        .update({ total_points: newPoints, level: newLevel })
        .eq("id", santriId);

    revalidatePath("/");
    return { success: true, message: `Badge ${badge.nama} berhasil diberikan!` };
}

// Check and award badges based on santri achievements
export async function checkAndAwardBadges(santriId: string): Promise<string[]> {
    const supabase = await createClient();
    const awardedBadges: string[] = [];

    // Get all badges
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: badges } = await (supabase as any).from("badges").select("*");
    if (!badges) return [];

    // Get existing badges
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingBadges } = await (supabase as any)
        .from("santri_badges")
        .select("badge_id")
        .eq("santri_id", santriId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingBadgeIds = new Set((existingBadges || []).map((b: any) => b.badge_id));

    // Get santri data
    const { data: hafalanSelesai } = await supabase
        .from("hafalan_selesai")
        .select("juz")
        .eq("santri_id", santriId);

    const { data: tasmiMumtaz } = await supabase
        .from("hafalan_tasmi")
        .select("id")
        .eq("santri_id", santriId)
        .eq("predikat", "mumtaz");

    const hafalanCount = hafalanSelesai?.length || 0;
    const mumtazCount = tasmiMumtaz?.length || 0;

    // Check each badge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const badge of badges as any[]) {
        if (existingBadgeIds.has(badge.id)) continue;

        const syarat = badge.syarat as { type: string; value: number } | null;
        if (!syarat) continue;

        let eligible = false;

        switch (syarat.type) {
            case "hafalan_juz":
                eligible = hafalanCount >= syarat.value;
                break;
            case "mumtaz_count":
                eligible = mumtazCount >= syarat.value;
                break;
            // Add more cases as needed
        }

        if (eligible) {
            const result = await awardBadge(santriId, badge.code);
            if (result.success) {
                awardedBadges.push(badge.nama);
            }
        }
    }

    return awardedBadges;
}
