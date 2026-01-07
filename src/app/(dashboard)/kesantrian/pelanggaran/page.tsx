import { getPelanggaranList, getSantriDropdown } from "../actions";
import { PelanggaranTable } from "./pelanggaran-table";
import { createClient } from "@/lib/supabase/server";

export default async function PelanggaranPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

    const userRole = profile?.role || "ortu";

    const [pelanggaranData, santriList] = await Promise.all([
        getPelanggaranList(),
        getSantriDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pelanggaran</h1>
                <p className="text-gray-500 mt-1">
                    Catatan dan tracking pelanggaran santri
                </p>
            </div>
            <PelanggaranTable
                initialData={pelanggaranData}
                santriList={santriList}
                userRole={userRole}
            />
        </div>
    );
}
