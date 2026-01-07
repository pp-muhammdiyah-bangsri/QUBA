"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notifyAllParentsEvent } from "@/lib/notifications/auto-notify";

// ======= EVENT =======

const eventSchema = z.object({
    judul: z.string().min(1, "Judul event wajib diisi"),
    deskripsi: z.string().optional(),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggal_selesai: z.string().optional(),
    lokasi: z.string().optional(),
    jenis: z.enum(["umum", "akademik", "keagamaan", "sosial"]),
    is_active: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventSchema>;

export async function getEventList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("event")
        .select("*")
        .order("tanggal_mulai", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return data || [];
}

export async function createEvent(formData: EventFormData) {
    const supabase = await createClient();

    const validated = eventSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("event").insert(validated.data);

    if (error) {
        console.error("Error creating event:", error);
        return { error: error.message };
    }

    // Notify all parents about new event
    notifyAllParentsEvent(validated.data.judul, validated.data.tanggal_mulai).catch(console.error);

    revalidatePath("/event");
    return { success: true };
}

export async function updateEvent(id: string, formData: EventFormData) {
    const supabase = await createClient();

    const validated = eventSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("event")
        .update(validated.data)
        .eq("id", id);

    if (error) {
        console.error("Error updating event:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("event").delete().eq("id", id);

    if (error) {
        console.error("Error deleting event:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}

// ======= INFORMASI (Announcements) =======

const informasiSchema = z.object({
    judul: z.string().min(1, "Judul informasi wajib diisi"),
    konten: z.string().min(1, "Konten wajib diisi"),
    kategori: z.enum(["pengumuman", "berita", "info"]),
    is_pinned: z.boolean().default(false),
    is_active: z.boolean().default(true),
});

export type InformasiFormData = z.infer<typeof informasiSchema>;

export async function getInformasiList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("informasi")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error fetching informasi:", error);
        return [];
    }

    return data || [];
}

export async function createInformasi(formData: InformasiFormData) {
    const supabase = await createClient();

    const validated = informasiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("informasi").insert(validated.data);

    if (error) {
        console.error("Error creating informasi:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}

export async function updateInformasi(id: string, formData: InformasiFormData) {
    const supabase = await createClient();

    const validated = informasiSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("informasi")
        .update(validated.data)
        .eq("id", id);

    if (error) {
        console.error("Error updating informasi:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}

export async function deleteInformasi(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("informasi").delete().eq("id", id);

    if (error) {
        console.error("Error deleting informasi:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}

export async function toggleInformasiPin(id: string, isPinned: boolean) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("informasi")
        .update({ is_pinned: isPinned })
        .eq("id", id);

    if (error) {
        console.error("Error toggling pin:", error);
        return { error: error.message };
    }

    revalidatePath("/event");
    return { success: true };
}
