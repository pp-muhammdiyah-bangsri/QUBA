"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BulkAssignFilters = {
    jenjang?: string;
    status?: string;
    noKelas?: boolean;
    noHalaqoh?: boolean;
    kelasId?: string;
    halaqohId?: string;
};

export async function getSantriForBulk(filters: BulkAssignFilters = {}) {
    const supabase = await createClient();

    // Start query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("santri")
        .select(`
            id, nama, nis, jenjang, status,
            kelas:kelas_id(id, nama),
            halaqoh:halaqoh_id(id, nama)
        `)
        .order("nama", { ascending: true });

    // Apply filters
    if (filters.jenjang) {
        query = query.eq("jenjang", filters.jenjang);
    }

    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    if (filters.noKelas) {
        query = query.is("kelas_id", null);
    }

    if (filters.noHalaqoh) {
        query = query.is("halaqoh_id", null);
    }

    // Additional filters if needed (e.g. show only from specific class to move them)
    if (filters.kelasId) {
        query = query.eq("kelas_id", filters.kelasId);
    }

    if (filters.halaqohId) {
        query = query.eq("halaqoh_id", filters.halaqohId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching santri for bulk:", error);
        return [];
    }

    return data || [];
}

export async function bulkUpdateSantri(
    santriIds: string[],
    type: "kelas" | "halaqoh",
    targetId: string | null
) {
    const supabase = await createClient();

    if (!santriIds || santriIds.length === 0) {
        return { error: "Tidak ada santri yang dipilih" };
    }

    const updateData = type === "kelas"
        ? { kelas_id: targetId === "null" ? null : targetId }
        : { halaqoh_id: targetId === "null" ? null : targetId };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("santri")
        .update(updateData)
        .in("id", santriIds);

    if (error) {
        console.error("Error bulk update:", error);
        return { error: `Gagal update: ${error.message}` };
    }

    revalidatePath("/data-master/bulk-assign");
    revalidatePath("/data-santri");

    return { success: true, count: santriIds.length };
}
