import { getHafalanSelesaiList, getSantriDropdown, getAsatidzDropdown } from "../actions";
import { HafalanSelesaiTable } from "./hafalan-selesai-table";
import { createClient } from "@/lib/supabase/server";

export default async function HafalanSelesaiPage() {
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

    const [hafalanData, santriList, asatidzList] = await Promise.all([
        getHafalanSelesaiList(userRole === "ortu" && linkedSantriId ? linkedSantriId : undefined),
        getSantriDropdown(),
        getAsatidzDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hafalan Selesai</h1>
                <p className="text-gray-500 mt-1">
                    {userRole === "ortu"
                        ? "Daftar Juz yang sudah selesai dihafal oleh anak Anda."
                        : "Daftar Juz yang sudah selesai dihafal. Dapat ditambahkan manual untuk santri baru yang sudah memiliki hafalan."
                    }
                </p>
            </div>
            <HafalanSelesaiTable
                initialData={hafalanData}
                santriList={santriList}
                asatidzList={asatidzList}
                userRole={userRole}
            />
        </div>
    );
}
