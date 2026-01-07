"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notifyParentHafalanSelesai, notifyParentHafalanLembar, notifyParentHafalanTasmi } from "@/lib/notifications/auto-notify";

// ======= HAFALAN LEMBAR (Per Page Progress) =======

const hafalanLembarSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    juz: z.number().min(1).max(30, "Juz harus antara 1-30"),
    lembar: z.string().min(1, "Lembar wajib diisi"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    penguji_id: z.string().uuid().optional(),
    catatan: z.string().optional(),
});

export type HafalanLembarFormData = z.infer<typeof hafalanLembarSchema>;

export async function getHafalanLembarList(santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("hafalan_lembar")
        .select(`
            *,
            santri:santri_id(id, nama, nis),
            penguji:penguji_id(id, nama, jenis_kelamin)
        `)
        .order("tanggal", { ascending: false });

    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(1000);

    if (error) {
        console.error("Error fetching hafalan lembar:", error);
        return [];
    }

    return data || [];
}

export async function createHafalanLembar(formData: HafalanLembarFormData) {
    const supabase = await createClient();

    const validated = hafalanLembarSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // Check if this exact lembar already exists (prevent duplicate key error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingData } = await (supabase as any)
        .from("hafalan_lembar")
        .select("tanggal, santri:santri_id(nama)")
        .eq("santri_id", validated.data.santri_id)
        .eq("juz", validated.data.juz)
        .eq("lembar", validated.data.lembar)
        .maybeSingle();

    if (existingData) {
        const dateStr = new Date(existingData.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        const santriName = existingData.santri?.nama || "Santri ini";
        return {
            error: `Data sudah ada: ${santriName} - Juz ${validated.data.juz} Lembar ${validated.data.lembar} (${dateStr}). Pastikan Anda memilih santri yang benar atau cari data tersebut di tabel.`
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("hafalan_lembar").insert({
        santri_id: validated.data.santri_id,
        juz: validated.data.juz,
        lembar: validated.data.lembar,
        tanggal: validated.data.tanggal,
        penguji_id: validated.data.penguji_id || null,
        catatan: validated.data.catatan || null,
    });

    if (error) {
        console.error("Error creating hafalan lembar:", error);
        return { error: error.message };
    }

    // Notify parent about new hafalan lembar
    notifyParentHafalanLembar(
        validated.data.santri_id,
        validated.data.juz,
        validated.data.lembar
    ).catch(console.error);

    revalidatePath("/akademik/lembar");
    return { success: true };
}

export async function deleteHafalanLembar(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("hafalan_lembar").delete().eq("id", id);

    if (error) {
        console.error("Error deleting hafalan lembar:", error);
        return { error: error.message };
    }

    revalidatePath("/akademik/lembar");
    return { success: true };
}

// ======= HAFALAN SELESAI (Completed Juz) =======

export async function getHafalanSelesaiList(santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("hafalan_selesai")
        .select(`
            *,
            santri:santri_id(id, nama, nis),
            penguji:penguji_id(id, nama, jenis_kelamin)
        `)
        .order("tanggal", { ascending: false });

    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(1000);

    if (error) {
        console.error("Error fetching hafalan selesai:", error);
        return [];
    }

    return data || [];
}

const hafalanSelesaiSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    juz: z.number().min(1).max(30, "Juz harus antara 1-30"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    penguji_id: z.string().uuid().optional(),
    nilai: z.string().optional(),
    catatan: z.string().optional(),
});

export type HafalanSelesaiFormData = z.infer<typeof hafalanSelesaiSchema>;

export async function createHafalanSelesai(formData: HafalanSelesaiFormData) {
    const supabase = await createClient();

    const validated = hafalanSelesaiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    const { penguji_id, ...data } = validated.data;
    const insertData = penguji_id ? { ...data, penguji_id } : data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("hafalan_selesai")
        .insert(insertData);

    if (error) {
        console.error("Error creating hafalan selesai:", error);
        return { error: error.message };
    }

    // Auto-create 20 lembar entries for this juz (10 numbers x 2 sides A/B)
    // First check if any lembar already exists for this santri+juz
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: existingCount } = await (supabase as any)
        .from("hafalan_lembar")
        .select("*", { count: "exact", head: true })
        .eq("santri_id", data.santri_id)
        .eq("juz", data.juz);

    // Only create lembar entries if none exist yet
    if (existingCount === 0) {
        const lembarEntries = [];
        for (let num = 1; num <= 10; num++) {
            lembarEntries.push({
                santri_id: data.santri_id,
                juz: data.juz,
                lembar: `${num}A`,
                tanggal: data.tanggal,
                penguji_id: penguji_id || null,
                catatan: data.catatan || "Auto-generated dari hafalan selesai",
            });
            lembarEntries.push({
                santri_id: data.santri_id,
                juz: data.juz,
                lembar: `${num}B`,
                tanggal: data.tanggal,
                penguji_id: penguji_id || null,
                catatan: data.catatan || "Auto-generated dari hafalan selesai",
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: lembarError } = await (supabase as any)
            .from("hafalan_lembar")
            .insert(lembarEntries);

        if (lembarError) {
            console.error("Error auto-creating lembar entries:", lembarError);
            // Don't fail the whole operation, just log the error
        }
    }

    // Notify parent about completed juz
    notifyParentHafalanSelesai(data.santri_id, data.juz).catch(console.error);

    revalidatePath("/akademik/selesai");
    revalidatePath("/akademik/lembar");
    revalidatePath("/akademik/progress");
    return { success: true };
}

export async function deleteHafalanSelesai(id: string) {
    const supabase = await createClient();

    // First, get the record to know santri_id and juz
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: record } = await (supabase as any)
        .from("hafalan_selesai")
        .select("santri_id, juz")
        .eq("id", id)
        .single();

    if (record) {
        // Delete corresponding lembar entries with same santri_id and juz
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from("hafalan_lembar")
            .delete()
            .eq("santri_id", record.santri_id)
            .eq("juz", record.juz);
    }

    // Delete the hafalan_selesai record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("hafalan_selesai")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting hafalan selesai:", error);
        return { error: error.message };
    }

    revalidatePath("/akademik/selesai");
    revalidatePath("/akademik/lembar");
    revalidatePath("/akademik/progress");
    return { success: true };
}

// ======= HAFALAN TASMI (1 Juz Examination) =======

const hafalanTasmiSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    juz: z.number().min(1).max(30, "Juz harus antara 1-30"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    penguji_id: z.string().uuid().optional(),
    predikat: z.enum(["mumtaz", "jayyid", "maqbul"]),
    nilai: z.number().min(0).max(100).optional(),
    catatan: z.string().optional(),
});

export type HafalanTasmiFormData = z.infer<typeof hafalanTasmiSchema>;

export async function getHafalanTasmiList(santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("hafalan_tasmi")
        .select(`
            *,
            santri:santri_id(id, nama, nis),
            penguji:penguji_id(id, nama, jenis_kelamin)
        `)
        .order("tanggal", { ascending: false });

    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(1000);

    if (error) {
        console.error("Error fetching hafalan tasmi:", error);
        return [];
    }

    return data || [];
}

export async function createHafalanTasmi(formData: HafalanTasmiFormData) {
    const supabase = await createClient();

    const validated = hafalanTasmiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("hafalan_tasmi").insert({
        santri_id: validated.data.santri_id,
        juz: validated.data.juz,
        tanggal: validated.data.tanggal,
        penguji_id: validated.data.penguji_id || null,
        predikat: validated.data.predikat,
        nilai: validated.data.nilai || null,
        catatan: validated.data.catatan || null,
    });

    if (error) {
        console.error("Error creating hafalan tasmi:", error);
        return { error: error.message };
    }

    // Notify parent about tasmi result
    notifyParentHafalanTasmi(
        validated.data.santri_id,
        validated.data.juz,
        validated.data.predikat
    ).catch(console.error);

    revalidatePath("/akademik/tasmi");
    return { success: true };
}

export async function deleteHafalanTasmi(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("hafalan_tasmi").delete().eq("id", id);

    if (error) {
        console.error("Error deleting hafalan tasmi:", error);
        return { error: error.message };
    }

    revalidatePath("/akademik/tasmi");
    return { success: true };
}

// ======= PROGRESS STATISTICS =======

export async function getSantriProgress(santriId: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: selesai } = await (supabase as any)
        .from("hafalan_selesai")
        .select("juz")
        .eq("santri_id", santriId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lembar } = await (supabase as any)
        .from("hafalan_lembar")
        .select("juz, lembar")
        .eq("santri_id", santriId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasmi } = await (supabase as any)
        .from("hafalan_tasmi")
        .select("juz, predikat, nilai")
        .eq("santri_id", santriId);

    const juzProgress: Record<number, { lembarCount: number; selesai: boolean; tasmi?: { predikat: string; nilai?: number | null } }> = {};

    for (let i = 1; i <= 30; i++) {
        juzProgress[i] = { lembarCount: 0, selesai: false };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lembar as any[])?.forEach((l: { juz: number }) => {
        if (juzProgress[l.juz]) {
            juzProgress[l.juz].lembarCount++;
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selesai as any[])?.forEach((s: { juz: number }) => {
        if (juzProgress[s.juz]) {
            juzProgress[s.juz].selesai = true;
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tasmi as any[])?.forEach((t: { juz: number; predikat: string; nilai?: number | null }) => {
        if (juzProgress[t.juz]) {
            juzProgress[t.juz].tasmi = { predikat: t.predikat, nilai: t.nilai };
        }
    });

    return {
        totalJuzSelesai: (selesai as unknown[])?.length || 0,
        totalLembar: (lembar as unknown[])?.length || 0,
        totalTasmi: (tasmi as unknown[])?.length || 0,
        juzProgress,
    };
}

export async function getAllSantriProgressSummary() {
    // Use service client to bypass RLS so ortu can see all santri for comparison
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santriList } = await (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang")
        .eq("status", "aktif")
        .order("nama", { ascending: true });

    if (!santriList) return [];

    // Get completed juz data with juz numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: selesaiData } = await (supabase as any)
        .from("hafalan_selesai")
        .select("santri_id, juz");

    // Get lembar data with juz info to calculate in-progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lembarData } = await (supabase as any)
        .from("hafalan_lembar")
        .select("santri_id, juz");

    // Map completed juz per santri
    const selesaiMap: Record<string, number[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selesaiData as any[])?.forEach((s: { santri_id: string; juz: number }) => {
        if (!selesaiMap[s.santri_id]) selesaiMap[s.santri_id] = [];
        if (!selesaiMap[s.santri_id].includes(s.juz)) {
            selesaiMap[s.santri_id].push(s.juz);
        }
    });

    // Count lembar per juz per santri
    const lembarByJuz: Record<string, Record<number, number>> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lembarData as any[])?.forEach((l: { santri_id: string; juz: number }) => {
        if (!lembarByJuz[l.santri_id]) lembarByJuz[l.santri_id] = {};
        lembarByJuz[l.santri_id][l.juz] = (lembarByJuz[l.santri_id][l.juz] || 0) + 1;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (santriList as any[]).map((santri: { id: string; nama: string; nis: string; jenjang: string }) => {
        const completedJuz = selesaiMap[santri.id] || [];
        const juzLembar = lembarByJuz[santri.id] || {};

        // Find in-progress juz (has lembar but < 20 and not in completed)
        const inProgressJuz: { juz: number; lembar: number }[] = [];
        Object.entries(juzLembar).forEach(([juzStr, count]) => {
            const juz = parseInt(juzStr);
            if (!completedJuz.includes(juz) && count < 20) {
                inProgressJuz.push({ juz, lembar: count });
            }
        });

        // Sort arrays
        completedJuz.sort((a, b) => a - b);
        inProgressJuz.sort((a, b) => a.juz - b.juz);

        // Calculate total lembar and percentage
        const totalLembar = Object.values(juzLembar).reduce((sum, count) => sum + count, 0);

        return {
            ...santri,
            juzSelesai: completedJuz, // Array of completed juz numbers
            sedangDihafal: inProgressJuz, // Array of {juz, lembar} for in-progress
            lembarTotal: totalLembar,
        };
    });
}

export async function getSantriDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("santri")
        .select("id, nama, nis")
        .eq("status", "aktif")
        .order("nama", { ascending: true });
    return data || [];
}

export async function getAsatidzDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("asatidz")
        .select("id, nama, jenis_kelamin")
        .order("nama", { ascending: true });
    return data || [];
}

export async function getCompletedJuzBySantri(): Promise<Record<string, number[]>> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("hafalan_selesai")
        .select("santri_id, juz");

    const result: Record<string, number[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any[])?.forEach((item: { santri_id: string; juz: number }) => {
        if (!result[item.santri_id]) result[item.santri_id] = [];
        if (!result[item.santri_id].includes(item.juz)) {
            result[item.santri_id].push(item.juz);
        }
    });

    return result;
}
