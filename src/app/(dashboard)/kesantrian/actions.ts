"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notifyParentPelanggaran, notifyParentPerizinan } from "@/lib/notifications/auto-notify";

// ======= PELANGGARAN (Violations) =======

const pelanggaranSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    deskripsi: z.string().min(1, "Deskripsi pelanggaran wajib diisi"),
    poin: z.number().min(0).optional(),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    penyelesaian: z.string().optional(),
});

export type PelanggaranFormData = z.infer<typeof pelanggaranSchema>;

export async function getPelanggaranList(santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("pelanggaran")
        .select(`
            *,
            santri:santri_id(id, nama, nis, jenjang)
        `)
        .order("tanggal", { ascending: false });

    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
        console.error("Error fetching pelanggaran:", error);
        return [];
    }

    return data || [];
}

export async function createPelanggaran(formData: PelanggaranFormData) {
    const supabase = await createClient();

    const validated = pelanggaranSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("pelanggaran").insert({
        santri_id: validated.data.santri_id,
        deskripsi: validated.data.deskripsi,
        poin: validated.data.poin || null,
        tanggal: validated.data.tanggal,
        penyelesaian: validated.data.penyelesaian || null,
    });

    if (error) {
        console.error("Error creating pelanggaran:", error);
        return { error: error.message };
    }

    // Notify parent
    // Notify parent
    try {
        await notifyParentPelanggaran(validated.data.santri_id, validated.data.deskripsi);
    } catch (e) {
        console.error("Failed to notify parent:", e);
    }

    revalidatePath("/kesantrian/pelanggaran");
    return { success: true };
}

export async function updatePelanggaran(id: string, formData: PelanggaranFormData) {
    const supabase = await createClient();

    const validated = pelanggaranSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("pelanggaran")
        .update({
            santri_id: validated.data.santri_id,
            deskripsi: validated.data.deskripsi,
            poin: validated.data.poin || null,
            tanggal: validated.data.tanggal,
            penyelesaian: validated.data.penyelesaian || null,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating pelanggaran:", error);
        return { error: error.message };
    }

    revalidatePath("/kesantrian/pelanggaran");
    return { success: true };
}

export async function deletePelanggaran(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("pelanggaran").delete().eq("id", id);

    if (error) {
        console.error("Error deleting pelanggaran:", error);
        return { error: error.message };
    }

    revalidatePath("/kesantrian/pelanggaran");
    return { success: true };
}

// ======= PERIZINAN (Permissions) =======

const perizinanSchema = z.object({
    santri_id: z.string().uuid("Santri wajib dipilih"),
    alasan: z.string().min(1, "Alasan izin wajib diisi"),
    status: z.enum(["pending", "approved", "rejected"]),
    tgl_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tgl_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
});

export type PerizinanFormData = z.infer<typeof perizinanSchema>;

export async function getPerizinanList(santriId?: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("perizinan")
        .select(`
            *,
            santri:santri_id(id, nama, nis, jenjang)
        `)
        .order("tgl_mulai", { ascending: false });

    if (santriId) {
        query = query.eq("santri_id", santriId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
        console.error("Error fetching perizinan:", error);
        return [];
    }

    return data || [];
}

export async function createPerizinan(formData: PerizinanFormData) {
    // Use service client to bypass RLS for ortu inserts
    const supabase = createServiceClient();

    const validated = perizinanSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("perizinan").insert({
        santri_id: validated.data.santri_id,
        alasan: validated.data.alasan,
        status: validated.data.status,
        tgl_mulai: validated.data.tgl_mulai,
        tgl_selesai: validated.data.tgl_selesai,
    });

    if (error) {
        console.error("Error creating perizinan:", error);
        return { error: error.message };
    }

    revalidatePath("/kesantrian/perizinan");
    return { success: true };
}

export async function updatePerizinanStatus(id: string, status: "pending" | "approved" | "rejected") {
    const supabase = await createClient();

    // Get santri_id before update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: perizinan } = await (supabase as any)
        .from("perizinan")
        .select("santri_id")
        .eq("id", id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("perizinan")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Error updating perizinan:", error);
        return { error: error.message };
    }

    // Notify parent if status changed to approved/rejected
    if (perizinan?.santri_id && (status === "approved" || status === "rejected")) {
        try {
            await notifyParentPerizinan(perizinan.santri_id, status);
        } catch (e) {
            console.error("Failed to notify parent:", e);
        }
    }

    revalidatePath("/kesantrian/perizinan");
    return { success: true };
}

export async function deletePerizinan(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("perizinan").delete().eq("id", id);

    if (error) {
        console.error("Error deleting perizinan:", error);
        return { error: error.message };
    }

    revalidatePath("/kesantrian/perizinan");
    return { success: true };
}

// Helper
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
