"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ======= SHARED TYPES =======
export interface Kelas {
    id: string;
    nama: string;
    tingkat: number;
    wali_kelas_id: string | null;
    wali_kelas?: { id: string; nama: string; jenis_kelamin?: "L" | "P" | null } | null;
    created_at: string;
}

export interface Halaqoh {
    id: string;
    nama: string;
    musyrif_id: string | null;
    musyrif?: { id: string; nama: string; jenis_kelamin?: "L" | "P" | null } | null;
    created_at: string;
}

// ======= KELAS ACTIONS =======

const kelasSchema = z.object({
    nama: z.string().min(1, "Nama kelas wajib diisi"),
    tingkat: z.number().min(7).max(12, "Tingkat harus antara 7-12"),
    wali_kelas_id: z.string().uuid().optional().nullable(),
});

export type KelasFormData = z.infer<typeof kelasSchema>;

export async function getKelasList(): Promise<Kelas[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("kelas")
        .select(`
            *,
            wali_kelas:wali_kelas_id(id, nama, jenis_kelamin)
        `)
        .order("tingkat", { ascending: true })
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching kelas:", error);
        return [];
    }
    return data || [];
}

export async function createKelas(formData: KelasFormData) {
    const supabase = await createClient();

    const validated = kelasSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    const { wali_kelas_id, ...data } = validated.data;
    const insertData = wali_kelas_id ? { ...data, wali_kelas_id } : data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("kelas").insert(insertData);

    if (error) {
        console.error("Error creating kelas:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/kelas");
    return { success: true };
}

export async function updateKelas(id: string, formData: KelasFormData) {
    const supabase = await createClient();

    const validated = kelasSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("kelas")
        .update({
            nama: validated.data.nama,
            tingkat: validated.data.tingkat,
            wali_kelas_id: validated.data.wali_kelas_id || null,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating kelas:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/kelas");
    return { success: true };
}

export async function deleteKelas(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("kelas").delete().eq("id", id);

    if (error) {
        console.error("Error deleting kelas:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/kelas");
    return { success: true };
}

// ======= HALAQOH ACTIONS =======

const halaqohSchema = z.object({
    nama: z.string().min(1, "Nama halaqoh wajib diisi"),
    musyrif_id: z.string().uuid().optional().nullable(),
});

export type HalaqohFormData = z.infer<typeof halaqohSchema>;

export async function getHalaqohList(): Promise<Halaqoh[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("halaqoh")
        .select(`
            *,
            musyrif:musyrif_id(id, nama, jenis_kelamin)
        `)
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching halaqoh:", error);
        return [];
    }
    return data || [];
}

export async function createHalaqoh(formData: HalaqohFormData) {
    const supabase = await createClient();

    const validated = halaqohSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    const { musyrif_id, ...data } = validated.data;
    const insertData = musyrif_id ? { ...data, musyrif_id } : data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("halaqoh").insert(insertData);

    if (error) {
        console.error("Error creating halaqoh:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/halaqoh");
    return { success: true };
}

export async function updateHalaqoh(id: string, formData: HalaqohFormData) {
    const supabase = await createClient();

    const validated = halaqohSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("halaqoh")
        .update({
            nama: validated.data.nama,
            musyrif_id: validated.data.musyrif_id || null,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating halaqoh:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/halaqoh");
    return { success: true };
}

export async function deleteHalaqoh(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("halaqoh").delete().eq("id", id);

    if (error) {
        console.error("Error deleting halaqoh:", error);
        return { error: error.message };
    }

    revalidatePath("/data-master/halaqoh");
    return { success: true };
}

// ======= DROPDOWN HELPERS =======

export async function getKelasDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("kelas")
        .select("id, nama, tingkat")
        .order("tingkat", { ascending: true })
        .order("nama", { ascending: true });
    return data || [];
}

export async function getHalaqohDropdown() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("halaqoh")
        .select("id, nama")
        .order("nama", { ascending: true });
    return data || [];
}
