"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type JadwalRutin = {
    id: string;
    nama_kegiatan: string;
    jam_mulai: string;
    jam_selesai: string;
    hari_aktif: number[];
    kode_presensi: string;
    target_gender: 'all' | 'L' | 'P';
};

export async function getJadwalRutin() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("jadwal_rutin")
        .select("*")
        .order("created_at", { ascending: true });
    return data as JadwalRutin[];
}

export async function createJadwalRutin(formData: FormData) {
    const supabase = await createClient();
    const nama_kegiatan = formData.get("nama_kegiatan") as string;
    const jam_mulai = formData.get("jam_mulai") as string;
    const jam_selesai = formData.get("jam_selesai") as string;
    const kode_presensi = formData.get("kode_presensi") as string;
    const target_gender = (formData.get("target_gender") as string) || "all";

    // Parse hari_aktif from checkboxes (expected format: "1,2,3")
    const hari_aktif_str = formData.get("hari_aktif") as string;
    const hari_aktif = hari_aktif_str ? hari_aktif_str.split(",").map(Number) : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("jadwal_rutin") as any).insert({
        nama_kegiatan,
        jam_mulai,
        jam_selesai,
        hari_aktif,
        kode_presensi,
        target_gender,
    });

    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/data-master/jadwal-rutin");
}

export async function deleteJadwalRutin(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("jadwal_rutin").delete().eq("id", id);
    if (error) {
        console.error(error);
        return;
    }

    revalidatePath("/data-master/jadwal-rutin");
}
