import { getPerizinanList, getSantriDropdown } from "../actions";
import { PerizinanTable } from "./perizinan-table";
import { createClient } from "@/lib/supabase/server";

export default async function PerizinanPage() {
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

    const [perizinanData, santriList] = await Promise.all([
        getPerizinanList(userRole === "ortu" && linkedSantriId ? linkedSantriId : undefined),
        getSantriDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perizinan</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {userRole === "ortu"
                        ? "Ajukan permohonan izin untuk anak Anda"
                        : "Kelola pengajuan izin santri"
                    }
                </p>
            </div>
            <PerizinanTable
                initialData={perizinanData}
                santriList={santriList}
                userRole={userRole}
                linkedSantriId={linkedSantriId}
            />
        </div>
    );
}
