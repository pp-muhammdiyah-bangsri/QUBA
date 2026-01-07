import { getHafalanTasmiList, getSantriDropdown, getAsatidzDropdown } from "../actions";
import { HafalanTasmiTable } from "./hafalan-tasmi-table";
import { createClient } from "@/lib/supabase/server";

export default async function HafalanTasmiPage() {
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

    const [tasmiData, santriList, asatidzList] = await Promise.all([
        getHafalanTasmiList(userRole === "ortu" && linkedSantriId ? linkedSantriId : undefined),
        getSantriDropdown(),
        getAsatidzDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tasmi&apos; (Ujian Hafalan)</h1>
                <p className="text-gray-500 mt-1">
                    {userRole === "ortu"
                        ? "Hasil ujian hafalan anak Anda"
                        : "Input hasil ujian hafalan 1 Juz sekaligus (Mumtaz/Jayyid/Maqbul)"
                    }
                </p>
            </div>
            <HafalanTasmiTable
                initialData={tasmiData}
                santriList={santriList}
                asatidzList={asatidzList}
                userRole={userRole}
            />
        </div>
    );
}
