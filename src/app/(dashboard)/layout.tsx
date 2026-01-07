import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { Role } from "@/types/database.types";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    // Type assertion since table may not exist yet
    const profileData = profile as { role?: string; full_name?: string } | null;
    const userRole: Role = (profileData?.role as Role) || "ortu";
    const userName = profileData?.full_name || user.email || "User";

    return (
        <DashboardShell userRole={userRole} userName={userName}>
            {children}
        </DashboardShell>
    );
}
