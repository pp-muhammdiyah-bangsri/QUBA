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
            // Auto-create parent account with NIS@quba.app format
            try {
                const autoEmail = `${finalNis}@quba.app`;
                const cleanPhone = row.kontak_wali?.replace(/\D/g, "") || "123456";
                const password = cleanPhone.length > 6 ? cleanPhone : `Ortu${cleanPhone}`;
                let userId: string | null = null;
                let warningMsg = "";

                // 1. Check if profile exists (Direct DB query avoids listUsers pagination limits)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: existingProfile } = await (adminClient as any)
                    .from("profiles")
                    .select("id")
                    .eq("email", autoEmail)
                    .single();

                if (existingProfile) {
                    userId = existingProfile.id;
                } else {
                    // 2. If not in profiles, try to create in Auth
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: authData, error: authError } = await (adminClient as any).auth.admin.createUser({
                        email: autoEmail,
                        password: password,
                        email_confirm: true,
                    });

                    if (authData?.user) {
                        userId = authData.user.id;
                    } else if (authError?.message?.includes("already been registered")) {
                        // Edge case: User in Auth but not in Profiles. 
                        // Try to find them via listUsers (still potential bottleneck but rare case now)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { data: users } = await (adminClient as any).auth.admin.listUsers();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const found = users?.users?.find((u: any) => u.email === autoEmail);
                        if (found) userId = found.id;
                        else warningMsg = "User registered but not found in list (pagination limit)";
                    } else {
                        warningMsg = `Auth error: ${authError?.message}`;
                    }
                }

                // 3. Process Linking if User ID found
                if (userId && insertedSantri?.id) {
                    // Check profile existence again (or just upsert?)
                    // Upserting profiles is safer to ensure it exists

                    // Decide name: use row.nama_wali or current logic? 
                    // If creating new, use row.nama_wali. If existing, maybe keep existing name?
                    // Let's stick to update logic if exists.

                    if (existingProfile) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (adminClient as any).from("profiles").update({
                            linked_santri_id: insertedSantri.id,
                        }).eq("id", userId);
                    } else {
                        // Insert new profile
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const { error: profileError } = await (adminClient as any).from("profiles").insert({
                            id: userId,
                            email: autoEmail,
                            full_name: row.nama_wali || `Wali ${row.nama}`,
                            role: "ortu",
                            linked_santri_id: insertedSantri.id,
                        });
                        if (profileError) warningMsg = `Profile creation failed: ${profileError.message}`;
                    }
                } else if (!userId && !warningMsg) {
                    warningMsg = "Failed to obtain User ID for parent";
                }

                if (warningMsg) {
                    console.error(`[BulkImport] Warning for ${row.nama}: ${warningMsg}`);
                    // Optionally append to error? But we want to say "success" for santri creation
                    // We just log it for now as this is a background process enhancement
                }

            } catch (authErr: any) {
                console.error(`[BulkImport] Critical error linking parent for ${row.nama}:`, authErr);
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
