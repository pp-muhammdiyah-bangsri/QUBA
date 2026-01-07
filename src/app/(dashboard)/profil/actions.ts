"use server";

import { createClient, createAdminClient, createServiceClient } from "@/lib/supabase/server";

export async function getMyTeachers() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { waliKelas: null, musyrif: null };

    // Get linked santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("linked_santri_id")
        .eq("id", user.id)
        .single();

    if (!profile?.linked_santri_id) return { waliKelas: null, musyrif: null };

    // Get santri's kelas and halaqoh
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("kelas_id, halaqoh_id")
        .eq("id", profile.linked_santri_id)
        .single();

    if (!santri) return { waliKelas: null, musyrif: null };

    let waliKelas = null;
    let musyrif = null;

    // Get Wali Kelas
    if (santri.kelas_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: kelas } = await (supabase as any)
            .from("kelas")
            .select("wali_kelas_id")
            .eq("id", santri.kelas_id)
            .single();

        if (kelas?.wali_kelas_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from("asatidz")
                .select("id, nama, biografi, pendidikan, keahlian, foto_url")
                .eq("id", kelas.wali_kelas_id)
                .single();
            waliKelas = data;
        }
    }

    // Get Musyrif
    if (santri.halaqoh_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: halaqoh } = await (supabase as any)
            .from("halaqoh")
            .select("musyrif_id")
            .eq("id", santri.halaqoh_id)
            .single();

        if (halaqoh?.musyrif_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase as any)
                .from("asatidz")
                .select("id, nama, jenis_kelamin, biografi, pendidikan, keahlian, foto_url")
                .eq("id", halaqoh.musyrif_id)
                .single();
            musyrif = data;
        }
    }

    return { waliKelas, musyrif };
}

// Get all asatidz for Profil Asatidz page
export async function getAllAsatidz() {
    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("asatidz")
        .select("id, nama, jenis_kelamin, biografi, pendidikan, keahlian, foto_url")
        .order("nama", { ascending: true });

    if (error) {
        console.error("Error fetching asatidz:", JSON.stringify(error, null, 2));
        console.error("Error message:", error?.message);
        console.error("Error code:", error?.code);
        return [];
    }

    console.log("Asatidz data fetched:", data?.length ?? 0, "records");

    return data || [];
}

// Get child's teacher IDs (wali_kelas_id and musyrif_id)
export async function getChildTeacherIds() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { waliKelasId: null, musyrifId: null };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("linked_santri_id")
        .eq("id", user.id)
        .single();

    if (!profile?.linked_santri_id) return { waliKelasId: null, musyrifId: null };

    // Get santri's kelas and halaqoh
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("kelas_id, halaqoh_id")
        .eq("id", profile.linked_santri_id)
        .single();

    if (!santri) return { waliKelasId: null, musyrifId: null };

    let waliKelasId = null;
    let musyrifId = null;

    // Get Wali Kelas ID
    if (santri.kelas_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: kelas } = await (supabase as any)
            .from("kelas")
            .select("wali_kelas_id")
            .eq("id", santri.kelas_id)
            .single();
        waliKelasId = kelas?.wali_kelas_id || null;
    }

    // Get Musyrif ID
    if (santri.halaqoh_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: halaqoh } = await (supabase as any)
            .from("halaqoh")
            .select("musyrif_id")
            .eq("id", santri.halaqoh_id)
            .single();
        musyrifId = halaqoh?.musyrif_id || null;
    }

    return { waliKelasId, musyrifId };
}

// Update asatidz profile (using admin client to bypass RLS)
export async function updateAsatidzProfile(
    asatidzId: string,
    data: {
        nama?: string;
        biografi?: string;
        pendidikan?: string;
        keahlian?: string;
        kontak?: string;
        alamat?: string;
    }
) {
    console.log("updateAsatidzProfile called with ID:", asatidzId);
    console.log("Data to update:", JSON.stringify(data, null, 2));

    // Use simple service client (no SSR/cookies) for direct DB operations
    const supabase = createServiceClient();

    // First verify the record exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing, error: selectError } = await (supabase as any)
        .from("asatidz")
        .select("id, nama, biografi, pendidikan, keahlian")
        .eq("id", asatidzId)
        .single();

    console.log("Existing record:", JSON.stringify(existing, null, 2));
    if (selectError) {
        console.error("Error selecting asatidz:", JSON.stringify(selectError, null, 2));
        return { error: "Record tidak ditemukan: " + selectError.message };
    }

    // Update all profile fields
    const updateData: Record<string, string | null> = {
        biografi: data.biografi && data.biografi.trim() !== "" ? data.biografi : null,
        pendidikan: data.pendidikan && data.pendidikan.trim() !== "" ? data.pendidikan : null,
        keahlian: data.keahlian && data.keahlian.trim() !== "" ? data.keahlian : null,
        kontak: data.kontak && data.kontak.trim() !== "" ? data.kontak : null,
        alamat: data.alamat && data.alamat.trim() !== "" ? data.alamat : null,
    };

    // Only add nama if provided (to prevent accidental clearing)
    if (data.nama && data.nama.trim() !== "") {
        updateData.nama = data.nama.trim();
    }

    console.log("Update data (processed):", JSON.stringify(updateData, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: result, error, count } = await (supabase as any)
        .from("asatidz")
        .update(updateData)
        .eq("id", asatidzId)
        .select();

    console.log("Update result:", JSON.stringify(result, null, 2), "count:", count);

    if (error) {
        console.error("Error updating asatidz profile:", JSON.stringify(error, null, 2));
        return { error: error.message };
    }

    if (!result || result.length === 0) {
        console.error("Update did not affect any rows!");
        return { error: "Update gagal - tidak ada baris yang terpengaruh" };
    }

    console.log("Asatidz profile updated successfully:", asatidzId);
    return { success: true };
}

// Get current ustadz's own asatidz profile (with auto-link by email)
export async function getMyAsatidzProfile() {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("No user found");
        return null;
    }

    console.log("Looking for asatidz with user_id:", user.id);

    // Try to find by user_id first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data, error } = await (adminSupabase as any)
        .from("asatidz")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!error && data) {
        console.log("Asatidz found by user_id:", data.id, data.nama);
        return data;
    }

    console.log("No asatidz found by user_id, trying to auto-link...");

    // Get user's nama from profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userProfile } = await (adminSupabase as any)
        .from("profiles")
        .select("nama, role")
        .eq("id", user.id)
        .single();

    console.log("User profile:", userProfile?.nama, "role:", userProfile?.role);

    // Try to find asatidz by nama (for existing ustadz)
    if (userProfile?.nama) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: asatidzByNama, error: namaError } = await (adminSupabase as any)
            .from("asatidz")
            .select("*")
            .eq("nama", userProfile.nama)
            .is("user_id", null)  // Only match if not already linked
            .single();

        if (!namaError && asatidzByNama) {
            console.log("Found asatidz by nama:", asatidzByNama.id, asatidzByNama.nama);

            // Auto-link: Update asatidz.user_id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminSupabase as any)
                .from("asatidz")
                .update({ user_id: user.id })
                .eq("id", asatidzByNama.id);

            // Also update profiles.linked_asatidz_id
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminSupabase as any)
                .from("profiles")
                .update({ linked_asatidz_id: asatidzByNama.id })
                .eq("id", user.id);

            console.log("Auto-linked user", user.id, "to asatidz", asatidzByNama.id, "by nama match");

            // Return the updated record with user_id set
            return { ...asatidzByNama, user_id: user.id };
        } else {
            console.log("No asatidz found by nama:", namaError?.message);
        }
    }

    // Fallback: Try linked_asatidz_id from profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (adminSupabase as any)
        .from("profiles")
        .select("linked_asatidz_id")
        .eq("id", user.id)
        .single();

    console.log("Profile linked_asatidz_id:", profile?.linked_asatidz_id);

    if (profile?.linked_asatidz_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: asatidz } = await (adminSupabase as any)
            .from("asatidz")
            .select("*")
            .eq("id", profile.linked_asatidz_id)
            .single();
        return asatidz;
    }

    return null;
}
