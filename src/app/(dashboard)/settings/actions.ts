"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateEmail(newEmail: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Tidak terautentikasi" };
    }

    const { error } = await supabase.auth.updateUser({
        email: newEmail,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, message: "Email konfirmasi telah dikirim ke alamat email baru. Silakan cek inbox Anda." };
}

export async function updatePassword(currentPassword: string, newPassword: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Tidak terautentikasi" };
    }

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
    });

    if (signInError) {
        return { error: "Password saat ini salah" };
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, message: "Password berhasil diperbarui" };
}

export async function updateDisplayName(fullName: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Tidak terautentikasi" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, message: "Nama berhasil diperbarui" };
}

export async function getProfile() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Tidak terautentikasi" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const profileData = profile as { full_name?: string; role?: string } | null;

    return {
        email: user.email,
        fullName: profileData?.full_name || "",
        role: profileData?.role || "ortu",
    };
}
