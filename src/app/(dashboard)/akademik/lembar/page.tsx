import { getHafalanLembarList, getSantriDropdown, getAsatidzDropdown, getCompletedJuzBySantri } from "../actions";
import { HafalanLembarTable } from "./hafalan-lembar-table";
import { createClient } from "@/lib/supabase/server";

export default async function HafalanLembarPage() {
    const supabase = await createClient();

    // Get user role and linked santri
    const { data: { user } } = await supabase.auth.getUser();
    let userRole = "ortu";
    let linkedSantriId: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, linked_santri_id")
            .eq("id", user.id)
            .single();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = profile as any;
        userRole = profileData?.role || "ortu";
        linkedSantriId = profileData?.linked_santri_id || null;
    }

    const [hafalanData, santriList, asatidzList, completedJuzBySantri] = await Promise.all([
        getHafalanLembarList(userRole === "ortu" && linkedSantriId ? linkedSantriId : undefined),
        getSantriDropdown(),
        getAsatidzDropdown(),
        getCompletedJuzBySantri(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hafalan Lembar</h1>
                <p className="text-gray-500 mt-1">
                    {userRole === "ortu"
                        ? "Tracking hafalan per lembar anak Anda"
                        : "Input dan tracking hafalan per lembar/halaman"
                    }
                </p>
            </div>
            <HafalanLembarTable
                initialData={hafalanData}
                santriList={santriList}
                asatidzList={asatidzList}
                completedJuzBySantri={completedJuzBySantri}
                userRole={userRole}
            />
        </div>
    );
}
