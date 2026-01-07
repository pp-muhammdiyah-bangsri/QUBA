import { getSantriDropdown, getMonthOptions, getYearOptions } from "./actions";
import { LaporanViewer } from "./laporan-viewer";
import { createClient } from "@/lib/supabase/server";

export default async function LaporanPage() {
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

    const [santriList, monthOptions, yearOptions] = await Promise.all([
        getSantriDropdown(),
        getMonthOptions(),
        getYearOptions(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Laporan Bulanan</h1>
                <p className="text-gray-500 mt-1">
                    {userRole === "ortu"
                        ? "Laporan perkembangan anak Anda"
                        : "Lihat dan cetak laporan perkembangan santri per bulan"
                    }
                </p>
            </div>
            <LaporanViewer
                santriList={santriList}
                monthOptions={monthOptions}
                yearOptions={yearOptions}
                userRole={userRole}
                linkedSantriId={linkedSantriId}
            />
        </div>
    );
}
