"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function getPublicTeachers() {
    const supabase = createServiceClient();

    // Fetch all asatidz for public display on PSB page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("asatidz")
        .select("id, nama, biografi, pendidikan, keahlian, foto_url, jenis_kelamin")
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching public teachers:", error);
        return [];
    }

    // Return all teachers - UI will handle display of those without full profile
    return data || [];
}

// Generate unique registration number
function generateRegistrationNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `PSB-${year}${month}${day}-${random}`;
}

// Submit PSB registration to database
export async function submitPSBRegistration(formData: {
    nama: string;
    nisn?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    jenisKelamin: string;
    jenjang?: string;
    program: string;
    asalSekolah?: string;
    alamat?: string;
    namaAyah?: string;
    namaIbu?: string;
    pekerjaanAyah?: string;
    pekerjaanIbu?: string;
    teleponWali?: string;
    emailWali?: string;
}) {
    const supabase = await createClient();
    const noRegistrasi = generateRegistrationNumber();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("pendaftar_psb")
        .insert({
            no_registrasi: noRegistrasi,
            nama: formData.nama,
            nisn: formData.nisn || null,
            tempat_lahir: formData.tempatLahir || null,
            tanggal_lahir: formData.tanggalLahir || null,
            jenis_kelamin: formData.jenisKelamin,
            jenjang: formData.jenjang || null,
            program: formData.program,
            asal_sekolah: formData.asalSekolah || null,
            alamat: formData.alamat || null,
            nama_ayah: formData.namaAyah || null,
            nama_ibu: formData.namaIbu || null,
            pekerjaan_ayah: formData.pekerjaanAyah || null,
            pekerjaan_ibu: formData.pekerjaanIbu || null,
            telepon_wali: formData.teleponWali || null,
            email_wali: formData.emailWali || null,
            status: "Menunggu",
        })
        .select()
        .single();

    if (error) {
        console.error("Error saving PSB registration:", error);
        return { success: false, error: error.message };
    }

    return { success: true, id: noRegistrasi, data };
}

// Fetch all PSB registrations (Admin only)
export async function getPendaftarPSB(status?: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("pendaftar_psb")
        .select("*")
        .order("created_at", { ascending: false });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching pendaftar PSB:", error);
        return [];
    }

    return data || [];
}

// Update PSB registration status (Admin only)
export async function updateStatusPendaftar(id: string, status: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("pendaftar_psb")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Error updating pendaftar status:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Delete PSB registration (Admin only)
export async function deletePendaftar(id: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("pendaftar_psb")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting pendaftar:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

