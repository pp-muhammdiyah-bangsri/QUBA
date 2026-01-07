"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ======= MAPEL (Subjects) =======

const mapelSchema = z.object({
    nama: z.string().min(1, "Nama mapel wajib diisi"),
    kategori: z.enum(["diniyah", "umum"]),
    kkm: z.number().min(0).max(100, "KKM harus 0-100"),
});

export type MapelFormData = z.infer<typeof mapelSchema>;

export async function getMapelList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("mapel")
        .select("*")
        .order("kategori", { ascending: true })
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching mapel:", error);
        return [];
    }

    return data || [];
}

export async function createMapel(formData: MapelFormData) {
    const supabase = await createClient();

    const validated = mapelSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("mapel").insert(validated.data);

    if (error) {
        console.error("Error creating mapel:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/mapel");
    return { success: true };
}

export async function updateMapel(id: string, formData: MapelFormData) {
    const supabase = await createClient();

    const validated = mapelSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("mapel")
        .update(validated.data)
        .eq("id", id);

    if (error) {
        console.error("Error updating mapel:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/mapel");
    return { success: true };
}

export async function deleteMapel(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("mapel").delete().eq("id", id);

    if (error) {
        console.error("Error deleting mapel:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/mapel");
    return { success: true };
}

// ======= NILAI (Grades) =======

const nilaiSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    mapel_id: z.string().uuid("Mapel wajib dipilih"),
    semester: z.string().min(1, "Semester wajib diisi"),
    nilai_uh: z.number().min(0).max(100).optional(),
    nilai_uts: z.number().min(0).max(100).optional(),
    nilai_uas: z.number().min(0).max(100).optional(),
    catatan: z.string().optional(),
});

export type NilaiFormData = z.infer<typeof nilaiSchema>;

export async function getNilaiList(semester?: string, santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("nilai")
        .select(`
            *,
            santri:santri_id(id, nama, nis, jenjang),
            mapel:mapel_id(id, nama, kategori, kkm)
        `)
        .order("santri_id", { ascending: true });

    if (semester) {
        query = query.eq("semester", semester);
    }
    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(500);

    if (error) {
        console.error("Error fetching nilai:", error);
        return [];
    }

    return data || [];
}

export async function createNilai(formData: NilaiFormData) {
    const supabase = await createClient();

    const validated = nilaiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // Calculate nilai_akhir
    const { nilai_uh, nilai_uts, nilai_uas } = validated.data;
    let nilai_akhir = null;
    if (nilai_uh !== undefined && nilai_uts !== undefined && nilai_uas !== undefined) {
        nilai_akhir = Math.round((nilai_uh * 0.3) + (nilai_uts * 0.3) + (nilai_uas * 0.4));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("nilai").insert({
        ...validated.data,
        nilai_akhir,
    });

    if (error) {
        console.error("Error creating nilai:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/input");
    return { success: true };
}

export async function updateNilai(id: string, formData: NilaiFormData) {
    const supabase = await createClient();

    const validated = nilaiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // Calculate nilai_akhir
    const { nilai_uh, nilai_uts, nilai_uas } = validated.data;
    let nilai_akhir = null;
    if (nilai_uh !== undefined && nilai_uts !== undefined && nilai_uas !== undefined) {
        nilai_akhir = Math.round((nilai_uh * 0.3) + (nilai_uts * 0.3) + (nilai_uas * 0.4));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("nilai")
        .update({
            ...validated.data,
            nilai_akhir,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating nilai:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/input");
    return { success: true };
}

export async function deleteNilai(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("nilai").delete().eq("id", id);

    if (error) {
        console.error("Error deleting nilai:", error);
        return { error: error.message };
    }

    revalidatePath("/nilai/input");
    return { success: true };
}

// ======= RAPOT (Report Card) =======

export async function getRapotData(santriId: string, semester: string) {
    const supabase = await createClient();

    // Get santri info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("*")
        .eq("id", santriId)
        .single();

    // Get all nilai for this santri and semester
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: nilaiList } = await (supabase as any)
        .from("nilai")
        .select(`
            *,
            mapel:mapel_id(id, nama, kategori, kkm)
        `)
        .eq("santri_id", santriId)
        .eq("semester", semester);

    // Get hafalan progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hafalanSelesai } = await (supabase as any)
        .from("hafalan_selesai")
        .select("juz")
        .eq("santri_id", santriId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hafalanTasmi } = await (supabase as any)
        .from("hafalan_tasmi")
        .select("juz, predikat, nilai")
        .eq("santri_id", santriId);

    // Get presensi summary for period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: presensiData } = await (supabase as any)
        .from("presensi")
        .select("status")
        .eq("santri_id", santriId);

    const presensiSummary = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (presensiData as any[])?.forEach((p: { status: string }) => {
        presensiSummary[p.status as keyof typeof presensiSummary]++;
    });

    // Get pelanggaran count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: pelanggaranCount } = await (supabase as any)
        .from("pelanggaran")
        .select("*", { count: "exact", head: true })
        .eq("santri_id", santriId);

    return {
        santri,
        semester,
        nilaiList: nilaiList || [],
        hafalan: {
            juzSelesai: (hafalanSelesai as unknown[])?.length || 0,
            tasmiList: hafalanTasmi || [],
        },
        presensi: presensiSummary,
        pelanggaranCount: pelanggaranCount || 0,
    };
}

// ======= HELPERS =======

export async function getSantriDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang")
        .eq("status", "aktif")
        .order("nama", { ascending: true });
    return data || [];
}

export async function getMapelDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("mapel")
        .select("id, nama, kategori, kkm")
        .order("nama", { ascending: true });
    return data || [];
}

export async function getSemesterOptions() {
    const currentYear = new Date().getFullYear();
    return [
        `${currentYear - 1}/${currentYear} Ganjil`,
        `${currentYear - 1}/${currentYear} Genap`,
        `${currentYear}/${currentYear + 1} Ganjil`,
        `${currentYear}/${currentYear + 1} Genap`,
    ];
}
