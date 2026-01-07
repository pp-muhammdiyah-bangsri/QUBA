"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const asatidzSchema = z.object({
    nama: z.string().min(1, "Nama wajib diisi"),
    jenis_kelamin: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih" }),
    alamat: z.string().optional(),
    kontak: z.string().optional(),
    foto_url: z.string().optional(),
    biografi: z.string().optional(),
    pendidikan: z.string().optional(),
    keahlian: z.string().optional(),
});

export type AsatidzFormData = z.infer<typeof asatidzSchema>;

export async function getAsatidzList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("asatidz")
        .select("*")
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching asatidz:", error);
        return [];
    }

    return data || [];
}

export async function createAsatidz(formData: AsatidzFormData) {
    const supabase = await createClient();

    const validated = asatidzSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    const { foto_url, ...baseData } = validated.data;
    // Only include foto_url if it has a value (column may not exist yet)
    const asatidzData = foto_url ? { ...baseData, foto_url } : baseData;
    let userId: string | undefined;

    // Auto-create ustadz account with auto-generated email
    try {
        const adminClient = await createAdminClient();

        // Auto-generate email from name: ustadz.{name}@quba.app
        const cleanName = asatidzData.nama.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
        const autoEmail = `ustadz.${cleanName}@quba.app`;

        // Generate password: Ustadz_ + first 8 chars of name (lowercase, no spaces)
        const password = `Ustadz_${cleanName.substring(0, 8)}`;

        // Try to create auth user
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { data: authData, error: authError } = await (adminClient as any).auth.admin.createUser({
            email: autoEmail,
            password: password,
            email_confirm: true,
        });

        // If user already exists, try to find and use them
        if (authError && authError.message?.includes("already been registered")) {
            console.log("Ustadz user already exists, finding existing user:", autoEmail);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: users } = await (adminClient as any).auth.admin.listUsers();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingUser = users?.users?.find((u: any) => u.email === autoEmail);

            if (existingUser) {
                authData = { user: existingUser };
                authError = null;
                console.log("Found existing ustadz user:", existingUser.id);
            }
        }

        if (authError) {
            console.error("Error creating ustadz auth:", authError);
            return { error: `Gagal membuat akun: ${authError.message}` };
        }

        if (authData?.user) {
            userId = authData.user.id;

            // Check if profile exists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingProfile } = await (adminClient as any)
                .from("profiles")
                .select("id")
                .eq("id", authData.user.id)
                .single();

            if (!existingProfile) {
                // Create profile with ustadz role
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (adminClient as any).from("profiles").insert({
                    id: authData.user.id,
                    email: autoEmail,
                    full_name: asatidzData.nama,
                    role: "ustadz",
                });
            }
        }
    } catch (err) {
        console.error("Error in auto-auth:", err);
        return { error: "Terjadi kesalahan saat membuat akun" };
    }

    // Insert asatidz record with user_id if created
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("asatidz").insert({
        ...asatidzData,
        user_id: userId || null,
    });

    if (error) {
        console.error("Error creating asatidz:", error);
        return { error: error.message };
    }

    revalidatePath("/asatidz");
    return { success: true };
}

export async function updateAsatidz(id: string, formData: AsatidzFormData) {
    const supabase = await createClient();

    const validated = asatidzSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // Prepare update data
    const { foto_url, ...baseData } = validated.data;

    // Only include foto_url if it has a value (column may not exist yet)
    const updateData = foto_url ? { ...baseData, foto_url } : baseData;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("asatidz")
        .update(updateData)
        .eq("id", id);

    if (error) {
        console.error("Error updating asatidz:", error);
        return { error: error.message };
    }

    revalidatePath("/asatidz");
    return { success: true };
}

export async function deleteAsatidz(id: string) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 0. Get the ustadz data first (to preserve in historical records and get user_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ustadz } = await (supabase as any)
        .from("asatidz")
        .select("nama, user_id")
        .eq("id", id)
        .single();

    const ustadzNama = ustadz?.nama || "Ustadz Dihapus";
    const userId = ustadz?.user_id;

    // 1. Unlink from Kelas (Wali Kelas) - just set to null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("kelas")
        .update({ wali_kelas_id: null })
        .eq("wali_kelas_id", id);

    // 2. Unlink from Halaqoh (Musyrif) - just set to null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("halaqoh")
        .update({ musyrif_id: null })
        .eq("musyrif_id", id);

    // 3. Unlink from Hafalan tables (Penguji) - SAVE NAME before unlinking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("hafalan_lembar")
        .update({ penguji_id: null, penguji_nama: ustadzNama })
        .eq("penguji_id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("hafalan_tasmi")
        .update({ penguji_id: null, penguji_nama: ustadzNama })
        .eq("penguji_id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("hafalan_selesai")
        .update({ penguji_id: null, penguji_nama: ustadzNama })
        .eq("penguji_id", id);

    // 4. Delete the Asatidz
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("asatidz").delete().eq("id", id);

    if (error) {
        console.error("Error deleting asatidz:", error);
        return { error: `Gagal menghapus: ${error.message}` };
    }

    // 5. Delete associated Ustadz auth user (after asatidz deletion succeeds)
    if (userId) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminClient as any).auth.admin.deleteUser(userId);
            console.log("Deleted ustadz account:", userId);
        } catch (err) {
            console.error("Error deleting ustadz auth account:", err);
            // Continue even if auth deletion fails
        }
    }

    revalidatePath("/asatidz");
    return { success: true };
}
