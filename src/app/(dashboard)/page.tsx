import { createClient } from "@/lib/supabase/server";
import { formatShortName } from "@/lib/utils";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UstadzDashboard } from "@/components/dashboard/ustadz-dashboard";
import { OrtuDashboard } from "@/components/dashboard/ortu-dashboard";

async function getAdminStats() {
    const supabase = await createClient();

    const [santriResult, asatidzResult, hafalanResult, eventResult] = await Promise.all([
        supabase.from("santri").select("*", { count: "exact", head: true }),
        supabase.from("asatidz").select("*", { count: "exact", head: true }),
        supabase.from("hafalan_selesai").select("*", { count: "exact", head: true }),
        supabase.from("event").select("*", { count: "exact", head: true }),
    ]);

    return {
        santriCount: santriResult.count || 0,
        asatidzCount: asatidzResult.count || 0,
        hafalanCount: hafalanResult.count || 0,
        eventCount: eventResult.count || 0,
    };
}

async function getAdminChartData() {
    const supabase = await createClient();

    // 1. Jenjang Data - Include all santri
    const { data: santriData } = await supabase
        .from("santri")
        .select("jenjang");

    const total = santriData?.length || 0;
    const smpCount = (santriData || []).filter((s: any) => s.jenjang === "SMP").length;
    const smaCount = (santriData || []).filter((s: any) => s.jenjang === "SMA").length;
    const smkCount = (santriData || []).filter((s: any) => s.jenjang === "SMK").length;
    const otherCount = total - smpCount - smaCount - smkCount;

    const jenjangData = [
        { name: "SMP", value: smpCount },
        { name: "SMA", value: smaCount },
        { name: "SMK", value: smkCount },
    ];
    // Add "Lainnya" if there are any with different/null jenjang
    if (otherCount > 0) {
        jenjangData.push({ name: "Lainnya", value: otherCount });
    }

    // Helper for last 6 months - FIX: Set date to 1 first to avoid overflow
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1); // Fix: Set to 1st before subtracting months
        d.setMonth(d.getMonth() - i);
        months.push({
            name: d.toLocaleString("id-ID", { month: "short" }),
            monthIdx: d.getMonth(),
            year: d.getFullYear(),
            key: `${d.getFullYear()}-${d.getMonth()}`
        });
    }

    // Date range for query - also fix here
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1); // Fix: Set to 1st first
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const gteDate = sixMonthsAgo.toISOString().split('T')[0];

    // 2. Hafalan Data
    const { data: hafalanData } = await supabase
        .from("hafalan_selesai")
        .select("tanggal")
        .gte("tanggal", gteDate);

    const hafalanPerBulan = months.map(m => {
        const count = (hafalanData || []).filter((h: any) => {
            const d = new Date(h.tanggal);
            return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
        }).length;
        return { bulan: m.name, selesai: count };
    });

    // 3. Pelanggaran Data
    const { data: pelanggaranData } = await supabase
        .from("pelanggaran")
        .select("tanggal")
        .gte("tanggal", gteDate);

    const pelanggaranTrend = months.map(m => {
        const count = (pelanggaranData || []).filter((p: any) => {
            const d = new Date(p.tanggal);
            return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
        }).length;
        return { bulan: m.name, jumlah: count };
    });

    return { jenjangData, hafalanPerBulan, pelanggaranTrend };
}

async function getAdminExtraData() {
    const supabase = await createClient();
    const today = new Date().toISOString();

    // Fetch raw data
    const [hafalanRes, pelanggaranRes, perizinanRes, eventsRes] = await Promise.all([
        supabase.from("hafalan_selesai").select("id, tanggal, juz, santri(nama)").order("tanggal", { ascending: false }).limit(5),
        supabase.from("pelanggaran").select("id, tanggal, deskripsi, santri(nama)").order("tanggal", { ascending: false }).limit(5),
        supabase.from("perizinan").select("id, created_at, alasan, santri(nama)").order("created_at", { ascending: false }).limit(5),
        supabase.from("event").select("*").gte("tanggal_mulai", today).order("tanggal_mulai", { ascending: true }).limit(5)
    ]);

    // Format helper
    const timeAgo = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / 1000;
        if (diff < 60) return "Baru saja";
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        return d.toLocaleDateString("id-ID");
    };

    // Combine and sort activities
    const activities = [
        ...(hafalanRes.data || []).map((h: any) => ({
            id: `hafalan-${h.id}`,
            type: "hafalan" as const,
            text: `${formatShortName(h.santri?.nama) || 'Santri'} menyelesaikan Juz ${h.juz}`,
            time: timeAgo(h.tanggal),
            rawDate: new Date(h.tanggal)
        })),
        ...(pelanggaranRes.data || []).map((p: any) => ({
            id: `pelanggaran-${p.id}`,
            type: "pelanggaran" as const,
            text: `Pelanggaran: ${p.deskripsi} - ${formatShortName(p.santri?.nama) || 'Santri'}`,
            time: timeAgo(p.tanggal),
            rawDate: new Date(p.tanggal)
        })),
        ...(perizinanRes.data || []).map((p: any) => ({
            id: `perizinan-${p.id}`,
            type: "perizinan" as const,
            text: `Izin: ${p.alasan} - ${formatShortName(p.santri?.nama) || 'Santri'}`,
            time: timeAgo(p.created_at),
            rawDate: new Date(p.created_at)
        }))
    ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5);

    // Format events
    const upcomingEvents = (eventsRes.data || []).map((e: any) => ({
        id: e.id,
        nama: e.judul,
        tanggal: new Date(e.tanggal_mulai).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        lokasi: e.lokasi || "Lokasi belum ditentukan",
        jenis: e.jenis
    }));

    return { activities, upcomingEvents };
}

async function getUstadzData() {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const [santriResult, hafalanTodayResult, tasmiResult, eventResult, eventsResult, recentHafalanResult] = await Promise.all([
        supabase.from("santri").select("*", { count: "exact", head: true }).eq("status", "aktif"),
        supabase.from("hafalan_lembar").select("*", { count: "exact", head: true }).eq("tanggal", today),
        supabase.from("hafalan_tasmi").select("*", { count: "exact", head: true }),
        supabase.from("event").select("*", { count: "exact", head: true }).gte("tanggal_mulai", today),
        supabase.from("event").select("id, judul, tanggal_mulai, jenis").gte("tanggal_mulai", today).order("tanggal_mulai").limit(5),
        supabase.from("hafalan_lembar").select("id, juz, lembar, tanggal, santri:santri_id(id, nama, nis, jenjang)").order("tanggal", { ascending: false }).order("created_at", { ascending: false }).limit(20)
    ]);

    // Process recent santri uniqueness
    const processedSantri = new Map();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recentHafalanResult.data || []).forEach((h: any) => {
        if (h.santri && !processedSantri.has(h.santri.id) && processedSantri.size < 5) {
            processedSantri.set(h.santri.id, {
                id: h.santri.id,
                nama: formatShortName(h.santri.nama),
                nis: h.santri.nis,
                jenjang: h.santri.jenjang,
                lastHafalan: `Juz ${h.juz} Lembar ${h.lembar}`
            });
        }
    });

    // Fallback if no hafalan data, just show some santri
    let recentSantri = Array.from(processedSantri.values());
    if (recentSantri.length === 0) {
        const { data: fallbackSantri } = await supabase.from("santri").select("id, nama, nis, jenjang").eq("status", "aktif").limit(5);
        recentSantri = (fallbackSantri || []).map((s: any) => ({
            id: s.id,
            nama: s.nama,
            nis: s.nis,
            jenjang: s.jenjang,
            lastHafalan: "-"
        }));
    }

    return {
        stats: {
            santriCount: santriResult.count || 0,
            hafalanHariIni: hafalanTodayResult.count || 0,
            tasmiPending: tasmiResult.count || 0,
            eventCount: eventResult.count || 0,
        },
        recentSantri,
        upcomingEvents: (eventsResult.data || []).map((e: { id: string; judul: string; tanggal_mulai: string; jenis: string }) => ({
            id: e.id,
            nama: e.judul,
            tanggal: new Date(e.tanggal_mulai).toLocaleDateString("id-ID"),
            jenis: e.jenis,
        })),
    };
}

async function getOrtuData(userId: string) {
    const supabase = await createClient();

    // Get linked santri from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("linked_santri_id")
        .eq("id", userId)
        .single();

    // Type assertion
    const profileData = profile as { linked_santri_id?: string } | null;
    const santriId = profileData?.linked_santri_id;

    if (!santriId) {
        return { childInfo: null, hafalanProgress: { juzSelesai: 0, totalJuz: 30 }, presensiSummary: { hadir: 0, izin: 0, sakit: 0, alpa: 0 }, recentPelanggaran: [], recentPerizinan: [], upcomingEvents: [] };
    }

    const today = new Date().toISOString().split("T")[0];

    const [santriResult, hafalanResult, presensiResult, pelanggaranResult, perizinanResult, eventsResult] = await Promise.all([
        supabase.from("santri").select("nama, nis, jenjang, status").eq("id", santriId).single(),
        supabase.from("hafalan_selesai").select("juz, tanggal").eq("santri_id", santriId).order("tanggal", { ascending: false }),
        supabase.from("presensi").select("status").eq("santri_id", santriId),
        supabase.from("pelanggaran").select("id, deskripsi, tanggal, poin").eq("santri_id", santriId).order("tanggal", { ascending: false }).limit(3),
        supabase.from("perizinan").select("id, alasan, status, tgl_mulai, tgl_selesai").eq("santri_id", santriId).order("tgl_mulai", { ascending: false }).limit(3),
        supabase.from("event").select("*").gte("tanggal_mulai", today).order("tanggal_mulai", { ascending: true }).limit(5),
    ]);

    // Type assertions
    const santriData = santriResult.data as { nama: string; nis: string; jenjang: string; status: string } | null;
    const hafalanData = hafalanResult.data as { juz: number; tanggal: string }[] | null;
    const presensiData = presensiResult.data as { status: string }[] | null;
    const pelanggaranData = pelanggaranResult.data as { id: string; deskripsi: string; tanggal: string; poin?: number }[] | null;
    const perizinanData = perizinanResult.data as { id: string; alasan: string; status: string; tgl_mulai: string; tgl_selesai: string }[] | null;
    const upcomingEvents = (eventsResult.data || []).map((e: any) => ({
        id: e.id,
        nama: e.judul,
        tanggal: new Date(e.tanggal_mulai).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        lokasi: e.lokasi || "Lokasi belum ditentukan",
        jenis: e.jenis
    }));

    const presensiSummary = {
        hadir: presensiData?.filter(p => p.status === "hadir").length || 0,
        izin: presensiData?.filter(p => p.status === "izin").length || 0,
        sakit: presensiData?.filter(p => p.status === "sakit").length || 0,
        alpa: presensiData?.filter(p => p.status === "alpa").length || 0,
    };

    return {
        childInfo: santriData ? {
            nama: santriData.nama,
            nis: santriData.nis,
            jenjang: santriData.jenjang,
            status: santriData.status,
        } : null,
        hafalanProgress: {
            juzSelesai: hafalanData?.length || 0,
            totalJuz: 30,
            lastHafalan: hafalanData?.[0] ? {
                juz: hafalanData[0].juz,
                tanggal: new Date(hafalanData[0].tanggal).toLocaleDateString("id-ID"),
            } : undefined,
        },
        presensiSummary,
        recentPelanggaran: (pelanggaranData || []).map(p => ({
            id: p.id,
            deskripsi: p.deskripsi,
            tanggal: new Date(p.tanggal).toLocaleDateString("id-ID"),
            poin: p.poin,
        })),
        recentPerizinan: (perizinanData || []).map(p => ({
            id: p.id,
            alasan: p.alasan,
            status: p.status,
            tglMulai: new Date(p.tgl_mulai).toLocaleDateString("id-ID"),
            tglSelesai: new Date(p.tgl_selesai).toLocaleDateString("id-ID"),
        })),
        upcomingEvents,
    };
}

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get user role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const profileData = profile as { role?: string } | null;
    const userRole = profileData?.role || "ortu";

    // Render based on role
    if (userRole === "admin") {
        const stats = await getAdminStats();
        const chartData = await getAdminChartData();
        const extraData = await getAdminExtraData();
        return (
            <AdminDashboard
                stats={stats}
                chartData={chartData}
                recentActivities={extraData.activities}
                upcomingEvents={extraData.upcomingEvents}
            />
        );
    }

    if (userRole === "ustadz") {
        const data = await getUstadzData();
        return <UstadzDashboard stats={data.stats} recentSantri={data.recentSantri} upcomingEvents={data.upcomingEvents} />;
    }

    // Default: ortu
    const data = await getOrtuData(user.id);
    return (
        <OrtuDashboard
            childInfo={data.childInfo}
            hafalanProgress={data.hafalanProgress}
            presensiSummary={data.presensiSummary}
            recentPelanggaran={data.recentPelanggaran}
            recentPerizinan={data.recentPerizinan}
            upcomingEvents={data.upcomingEvents}
        />
    );
}