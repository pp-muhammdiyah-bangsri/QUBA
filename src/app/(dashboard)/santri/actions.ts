"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const santriSchema = z.object({
    nis: z.string().min(1, "NIS wajib diisi"),
    nama: z.string().min(1, "Nama wajib diisi"),
    jenis_kelamin: z.enum(["L", "P"]),
    alamat: z.string().optional(),
    nama_wali: z.string().optional(),
    kontak_wali: z.string().optional(),
    jenjang: z.enum(["SMP", "SMA", "SMK"]),
    status: z.string().default("aktif"),
    foto_url: z.string().optional(),
    kelas_id: z.string().uuid().optional().nullable(),
    halaqoh_id: z.string().uuid().optional().nullable(),
});

export type SantriFormData = z.infer<typeof santriSchema>;

export async function getSantriList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("santri")
        .select("*")
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching santri:", error);
        return [];
    }

    return data || [];
}

export async function getSantriById(id: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("santri")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching santri:", error);
        return null;
    }

    return data;
}

export async function createSantri(formData: SantriFormData) {
    const supabase = await createClient();

    const validated = santriSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    const { foto_url, ...baseData } = validated.data;

    // Only include foto_url if it has a value (column may not exist yet)
    const santriData = foto_url ? { ...baseData, foto_url } : baseData;

    // Insert santri record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newSantri, error } = await (supabase as any)
        .from("santri")
        .insert(santriData)
        .select()
        .single();

    if (error) {
        console.error("Error creating santri:", error);
        return { error: error.message };
    }

    // Auto-create parent account with auto-generated email
    let authResult: { success: boolean; error?: string; email?: string; password?: string } | null = null;

    try {
        const adminClient = await createAdminClient();

        // Auto-generate email from NIS
        const autoEmail = `${santriData.nis}@quba.app`;

        // Password uses Phone Number (cleaned) if available, otherwise a default
        const cleanPhone = santriData.kontak_wali?.replace(/\D/g, "") || "123456";
        const password = cleanPhone.length > 6 ? cleanPhone : `Ortu${cleanPhone}`;

        // Try to create auth user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { data: authData, error: authError } = await (adminClient as any).auth.admin.createUser({
            email: autoEmail,
            password: password,
            email_confirm: true,
        });

        // If user already exists, try to find and use them
        if (authError && authError.message?.includes("already been registered")) {
            console.log("User already exists, finding existing user:", autoEmail);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: users } = await (adminClient as any).auth.admin.listUsers();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingUser = users?.users?.find((u: any) => u.email === autoEmail);

            if (existingUser) {
                authData = { user: existingUser };
                authError = null;
                console.log("Found existing user:", existingUser.id);
            }
        }

        if (authError) {
            console.error("Error creating parent auth:", authError);
            authResult = { success: false, error: authError.message };
        } else if (authData?.user) {
            // Create or update profile with ortu role and link to santri
            // First try to update existing profile
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingProfile } = await (adminClient as any)
                .from("profiles")
                .select("id")
                .eq("id", authData.user.id)
                .single();

            if (existingProfile) {
                // Update existing profile
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (adminClient as any).from("profiles").update({
                    linked_santri_id: newSantri.id,
                }).eq("id", authData.user.id);
                authResult = { success: true, email: autoEmail, password: "(existing)" };
            } else {
                // Create new profile
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: profileError } = await (adminClient as any).from("profiles").insert({
                    id: authData.user.id,
                    email: autoEmail,
                    full_name: santriData.nama_wali || `Wali ${santriData.nama}`,
                    role: "ortu",
                    linked_santri_id: newSantri.id,
                });

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    authResult = { success: false, error: `Auth berhasil, tapi profil gagal: ${profileError.message}` };
                } else {
                    authResult = { success: true, email: autoEmail, password: password };
                }
            }
        }
    } catch (err) {
        console.error("Error in auto-auth:", err);
        authResult = { success: false, error: String(err) };
    }

    revalidatePath("/santri");
    return { success: true, authResult };
}

export async function updateSantri(id: string, formData: SantriFormData) {
    const supabase = await createClient();

    const validated = santriSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // Prepare update data
    const { foto_url, ...santriData } = validated.data;

    // Only include foto_url if it has a value (column may not exist yet)
    const updateData = foto_url ? { ...santriData, foto_url } : santriData;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("santri")
        .update(updateData)
        .eq("id", id);

    if (error) {
        console.error("Error updating santri:", error);
        return { error: error.message };
    }

    revalidatePath("/santri");
    return { success: true };
}

export async function deleteSantri(id: string) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 1. Find and delete associated Ortu account (by linked_santri_id)
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ortuProfile } = await (adminClient as any)
            .from("profiles")
            .select("id")
            .eq("linked_santri_id", id)
            .single();

        if (ortuProfile?.id) {
            // Delete auth user (this will cascade delete the profile if configured)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminClient as any).auth.admin.deleteUser(ortuProfile.id);
            console.log("Deleted ortu account for santri:", id);
        }
    } catch (err) {
        console.error("Error deleting ortu account:", err);
        // Continue with santri deletion even if ortu deletion fails
    }

    // 2. Delete the Santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("santri").delete().eq("id", id);

    if (error) {
        console.error("Error deleting santri:", error);
        return { error: error.message };
    }

    revalidatePath("/santri");
    return { success: true };
}

export async function syncParentAccounts() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 1. Get all santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allSantri } = await (supabase as any).from("santri").select("*");
    if (!allSantri || allSantri.length === 0) return { success: true, processed: 0, linked: 0, errors: [] };

    // 2. Find santri who already have a parent linked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkedProfiles } = await (adminClient as any)
        .from("profiles")
        .select("linked_santri_id")
        .not("linked_santri_id", "is", null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkedSantriIds = new Set(linkedProfiles?.map((p: any) => p.linked_santri_id));

    // 3. Filter orphans
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orphans = (allSantri as any[]).filter(s => !linkedSantriIds.has(s.id));

    if (orphans.length === 0) {
        return { success: true, processed: 0, linked: 0, errors: [] };
    }

    let linked = 0;
    const errors: string[] = [];

    // 4. Process orphans
    for (const santri of orphans) {
        try {
            const autoEmail = `${santri.nis}@quba.app`;
            const cleanPhone = santri.kontak_wali?.replace(/\D/g, "") || "123456";
            const password = cleanPhone.length > 6 ? cleanPhone : `Ortu${cleanPhone}`;

            let userId: string | null = null;
            let warningMsg = "";

            // Check if profile exists by email (using admin client to bypass RLS if needed, though profiles should be readable)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingProfile } = await (adminClient as any)
                .from("profiles")
                .select("id")
                .eq("email", autoEmail)
                .single();

            if (existingProfile) {
                userId = existingProfile.id;
            } else {
                // Check Auth
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: authData, error: authError } = await (adminClient as any).auth.admin.createUser({
                    email: autoEmail,
                    password: password,
                    email_confirm: true,
                });

                if (authData?.user) {
                    userId = authData.user.id;
                } else if (authError?.message?.includes("already been registered")) {
                    // Try to find user in list
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: users } = await (adminClient as any).auth.admin.listUsers();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const found = users?.users?.find((u: any) => u.email === autoEmail);
                    if (found) userId = found.id;
                    else warningMsg = "User registered but not found (pagination limit)";
                } else {
                    warningMsg = `Auth error: ${authError?.message}`;
                }
            }

            if (userId) {
                if (existingProfile) {
                    // Update existing profile
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (adminClient as any).from("profiles").update({
                        linked_santri_id: santri.id,
                        role: "ortu", // Ensure role is ortu
                    }).eq("id", userId);
                } else {
                    // Create new profile
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (adminClient as any).from("profiles").insert({
                        id: userId,
                        email: autoEmail,
                        full_name: santri.nama_wali || `Wali ${santri.nama}`,
                        role: "ortu",
                        linked_santri_id: santri.id,
                    });
                }
                linked++;
            } else {
                if (warningMsg) errors.push(`${santri.nama}: ${warningMsg}`);
            }

        } catch (err: any) {
            errors.push(`${santri.nama}: ${err.message}`);
        }
    }

    revalidatePath("/santri");
    return { success: true, processed: orphans.length, linked, errors };
}
