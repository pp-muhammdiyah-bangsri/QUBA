import { getEventList, getInformasiList } from "./actions";
import { EventPage } from "./event-page";
import { createClient } from "@/lib/supabase/server";

export default async function EventInfoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

    const userRole = profile?.role || "ortu";

    const [eventData, informasiData] = await Promise.all([
        getEventList(),
        getInformasiList(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Event & Informasi</h1>
                <p className="text-gray-500 mt-1">
                    Kelola event dan informasi pesantren
                </p>
            </div>
            <EventPage
                initialEvents={eventData}
                initialInformasi={informasiData}
                userRole={userRole}
            />
        </div>
    );
}
