"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ImportedSantri {
    nis: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    jenjang: "SMP" | "SMA" | "SMK";
    alamat?: string;
    nama_wali?: string;
    kontak_wali?: string;
}

export interface ImportResult {
    success: boolean;
    row: number;
    nis: string;
    nama: string;
    error?: string;
}

export async function bulkImportSantri(data: ImportedSantri[]): Promise<ImportResult[]> {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const results: ImportResult[] = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; // Excel row (1-indexed + header)

        try {
            // Validate required fields (NIS is now optional, will be auto-generated if empty)
            if (!row.nama || !row.jenjang) {
                results.push({
                    success: false,
                    row: rowNum,
                    nis: row.nis || "-",
                    nama: row.nama || "-",
                    error: "Nama dan Jenjang wajib diisi",
                });
                continue;
            }

            // Auto-generate NIS if empty
            let finalNis = row.nis;
            if (!finalNis) {
                const timestamp = Date.now().toString().slice(-6);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
                finalNis = `SYS${timestamp}${random}`;
            }

            // Check if NIS already exists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existing } = await (supabase as any)
                .from("santri")
                .select("id")
                .eq("nis", finalNis)
                .single();

            if (existing) {
                results.push({
                    success: false,
                    row: rowNum,
                    nis: row.nis,
                    nama: row.nama,
                    error: "NIS sudah terdaftar",
                });
                continue;
            }

            // Validate jenjang
            if (row.jenjang !== "SMP" && row.jenjang !== "SMA" && row.jenjang !== "SMK") {
                results.push({
                    success: false,
                    row: rowNum,
                    nis: row.nis,
                    nama: row.nama,
                    error: "Jenjang harus SMP, SMA, atau SMK",
                });
                continue;
            }

            // Validate jenis_kelamin
            if (row.jenis_kelamin !== "L" && row.jenis_kelamin !== "P") {
                results.push({
                    success: false,
                    row: rowNum,
                    nis: row.nis,
                    nama: row.nama,
                    error: "Jenis Kelamin harus L atau P",
                });
                continue;
            }

            // Insert santri
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: insertedSantri, error: insertError } = await (supabase as any)
                .from("santri")
                .insert({
                    nis: finalNis,
                    nama: row.nama,
                    jenis_kelamin: row.jenis_kelamin,
                    jenjang: row.jenjang,
                    alamat: row.alamat || null,
                    nama_wali: row.nama_wali || null,
                    kontak_wali: row.kontak_wali || null,
                    status: "aktif",
                })
                .select()
                .single();

            if (insertError) {
                results.push({
                    success: false,
                    row: rowNum,
                    nis: row.nis,
                    nama: row.nama,
                    error: insertError.message,
                });
                continue;
            }

            // Auto-create parent account with NIS@quba.app format
            try {
                const autoEmail = `${finalNis}@quba.app`;
                const cleanPhone = row.kontak_wali?.replace(/\D/g, "") || "123456";
                const password = cleanPhone.length > 6 ? cleanPhone : `Ortu${cleanPhone}`;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let { data: authData, error: authError } = await (adminClient as any).auth.admin.createUser({
                    email: autoEmail,
                    password: password,
                    email_confirm: true,
                });

                // If user already exists, find them and update their profile
                if (authError && authError.message?.includes("already been registered")) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: users } = await (adminClient as any).auth.admin.listUsers();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const existingUser = users?.users?.find((u: any) => u.email === autoEmail);

                    if (existingUser) {
                        authData = { user: existingUser };
                        authError = null;
                    }
                }

                // Create or update profile with ortu role and link to santri
                if (authData?.user && insertedSantri?.id) {
                    // First check if profile exists
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: existingProfile } = await (adminClient as any)
                        .from("profiles")
                        .select("id")
                        .eq("id", authData.user.id)
                        .single();

                    if (existingProfile) {
                        // Update existing profile to link to this santri
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (adminClient as any).from("profiles").update({
                            linked_santri_id: insertedSantri.id,
                        }).eq("id", authData.user.id);
                    } else {
                        // Create new profile
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (adminClient as any).from("profiles").insert({
                            id: authData.user.id,
                            email: autoEmail,
                            full_name: row.nama_wali || `Wali ${row.nama}`,
                            role: "ortu",
                            linked_santri_id: insertedSantri.id,
                        });
                    }
                }
            } catch {
                // Ignore auth errors for now (e.g., network issues)
            }

            results.push({
                success: true,
                row: rowNum,
                nis: finalNis,
                nama: row.nama,
            });
        } catch (err: any) {
            results.push({
                success: false,
                row: rowNum,
                nis: row.nis || "-",
                nama: row.nama || "-",
                error: err.message || "Unknown error",
            });
        }
    }

    revalidatePath("/santri");
    return results;
}
