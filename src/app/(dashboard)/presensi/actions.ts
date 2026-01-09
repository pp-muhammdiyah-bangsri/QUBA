"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ======= KEGIATAN (Activities) =======

const kegiatanSchema = z.object({
    nama: z.string().min(1, "Nama kegiatan wajib diisi"),
    jenis: z.enum(["pembelajaran", "kajian", "event_umum"]),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
    tanggal_selesai: z.string().optional(),
    lokasi: z.string().optional(),
    deskripsi: z.string().optional(),
});

export type KegiatanFormData = z.infer<typeof kegiatanSchema>;

export async function generateDailySchedules() {
    const supabase = await createClient();
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayOfWeek = today.getDay() || 7; // Convert 0(Sun) -> 7

    // 1. Get ALL Routines first (debug), then filter manually or use correct syntax
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allRoutines, error: routineErr } = await (supabase.from("jadwal_rutin") as any)
        .select("*");

    if (routineErr) {
        console.error("Error fetching routines:", routineErr);
        return;
    }

    // Filter manually for today's day - handle both string and number in array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routines = (allRoutines as any[])?.filter((r) => {
        const hariAktif = r.hari_aktif || [];
        // Check if any element matches dayOfWeek (as string or number)
        return hariAktif.some((h: number | string) => Number(h) === dayOfWeek);
    }) || [];

    if (!routines || routines.length === 0) return;

    // 2. Check which ones are already created for today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from("kegiatan") as any)
        .select("jadwal_rutin_id")
        .eq("tanggal_mulai", todayString)
        .not("jadwal_rutin_id", "is", null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingIds = new Set((existing as any[])?.map((e) => e.jadwal_rutin_id) || []);

    // 3. Create missing activities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toCreate = (routines as any[]).filter((r) => !existingIds.has(r.id));

    if (toCreate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("kegiatan") as any).insert(
            toCreate.map((r) => ({
                nama: r.nama_kegiatan,
                jenis: "pembelajaran", // Default type
                tanggal_mulai: todayString,
                lokasi: "Sesuai Jadwal",
                jadwal_rutin_id: r.id,
                deskripsi: `Auto-generated: ${r.kode_presensi}`
            }))
        );
        // Note: revalidatePath removed - called during render is not allowed
        // Data will be fresh on next getKegiatanList call
    }
}

export async function getKegiatanList() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("kegiatan")
        .select(`
            *,
            jadwal_rutin:jadwal_rutin_id(target_gender)
        `)
        .order("tanggal_mulai", { ascending: false })
        .limit(100);

    if (error) {
        console.error("Error fetching kegiatan:", error);
        return [];
    }

    return data || [];
}

export async function createKegiatan(formData: KegiatanFormData) {
    const supabase = await createClient();

    const role = await getUserRole();
    if (role !== "admin") {
        return { error: "Hanya Admin yang dapat membuat kegiatan" };
    }

    const validated = kegiatanSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("kegiatan").insert({
        nama: validated.data.nama,
        jenis: validated.data.jenis,
        tanggal_mulai: validated.data.tanggal_mulai,
        tanggal_selesai: validated.data.tanggal_selesai || null,
        lokasi: validated.data.lokasi || null,
        deskripsi: validated.data.deskripsi || null,
    });

    if (error) {
        console.error("Error creating kegiatan:", error);
        return { error: error.message };
    }

    revalidatePath("/presensi");
    return { success: true };
}

export async function updateKegiatan(id: string, formData: KegiatanFormData) {
    const supabase = await createClient();

    const role = await getUserRole();
    if (role !== "admin") {
        return { error: "Hanya Admin yang dapat mengubah kegiatan" };
    }

    const validated = kegiatanSchema.safeParse(formData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("kegiatan")
        .update({
            nama: validated.data.nama,
            jenis: validated.data.jenis,
            tanggal_mulai: validated.data.tanggal_mulai,
            tanggal_selesai: validated.data.tanggal_selesai || null,
            lokasi: validated.data.lokasi || null,
            deskripsi: validated.data.deskripsi || null,
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating kegiatan:", error);
        return { error: error.message };
    }

    revalidatePath("/presensi");
    return { success: true };
}

export async function deleteKegiatan(id: string) {
    const supabase = await createClient();

    const role = await getUserRole();
    if (role !== "admin") {
        return { error: "Hanya Admin yang dapat menghapus kegiatan" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("kegiatan").delete().eq("id", id);

    if (error) {
        console.error("Error deleting kegiatan:", error);
        return { error: error.message };
    }

    revalidatePath("/presensi");
    return { success: true };
}

// ======= PRESENSI (Attendance) =======

export async function getPresensiByKegiatan(kegiatanId: string) {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("presensi")
        .select(`
            *,
            santri:santri_id(id, nama, nis, jenjang)
        `)
        .eq("kegiatan_id", kegiatanId);

    if (error) {
        console.error("Error fetching presensi:", error);
        return [];
    }

    return data || [];
}

export async function bulkCreatePresensi(kegiatanId: string, presensiList: { santri_id: string; status: string; catatan?: string }[]) {
    const supabase = await createClient();

    // 1. Time Window Validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kegiatan } = await (supabase.from("kegiatan") as any)
        .select("*, jadwal_rutin:jadwal_rutin_id(*)")
        .eq("id", kegiatanId)
        .single();

    if (kegiatan?.jadwal_rutin) {
        const { jam_mulai, jam_selesai } = kegiatan.jadwal_rutin;

        // Use consistent Timezone (Asia/Jakarta)
        const now = new Date();
        const currentTime = now.toLocaleTimeString("en-GB", {
            timeZone: "Asia/Jakarta",
            hour12: false
        }); // Returns "HH:MM:SS"

        // Normalize time formats - database might have HH:MM:SS or HH:MM
        const normalizedCurrent = currentTime.substring(0, 5); // HH:MM
        const normalizedMulai = (jam_mulai || "").substring(0, 5);
        const normalizedSelesai = (jam_selesai || "").substring(0, 5);

        console.log("[bulkCreatePresensi] Time Check (WIB):", {
            serverTime: normalizedCurrent,
            scheduleStart: normalizedMulai,
            scheduleEnd: normalizedSelesai,
            rawNow: now.toISOString()
        });

        const isTimeValid = normalizedCurrent >= normalizedMulai && normalizedCurrent <= normalizedSelesai;

        console.log("[bulkCreatePresensi] isTimeValid:", isTimeValid);

        if (!isTimeValid) {
            // Check if user is admin to bypass
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.id) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: profile } = await (supabase.from("profiles") as any).select("role").eq("id", user.id).single();

                console.log("[bulkCreatePresensi] User role:", (profile as any)?.role);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((profile as any)?.role !== "admin") {
                    return { error: `Presensi hanya dapat diisi pada jam ${normalizedMulai} - ${normalizedSelesai}. Saat ini: ${normalizedCurrent}` };
                }
            } else {
                return { error: "User tidak ditemukan." };
            }
        }
    }

    // First delete existing presensi for this kegiatan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("presensi").delete().eq("kegiatan_id", kegiatanId);

    // Then insert new ones
    const insertData = presensiList.map((p) => ({
        kegiatan_id: kegiatanId,
        santri_id: p.santri_id,
        status: p.status,
        catatan: p.catatan || null,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("presensi").insert(insertData);

    if (error) {
        console.error("Error creating presensi:", error);
        return { error: error.message };
    }

    revalidatePath("/presensi");
    return { success: true };
}

// ======= REKAP PRESENSI =======

export async function getPresensiRekap(
    month?: number,
    year?: number,
    filterType: "all" | "kelas" | "halaqoh" = "all",
    filterId: string = "",
    kegiatanName: string = "",
    gender: "L" | "P" | "all" = "all"
) {
    const supabase = await createClient();
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split("T")[0];

    // 1. Get all relevant santri first (to ensure those with 0 attendance are included)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let santriQuery = (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang, jenis_kelamin, kelas_id, halaqoh_id")
        .eq("status", "aktif")
        .order("nama", { ascending: true });

    if (filterType === "kelas" && filterId) santriQuery = santriQuery.eq("kelas_id", filterId);
    if (filterType === "halaqoh" && filterId) santriQuery = santriQuery.eq("halaqoh_id", filterId);
    if (gender !== "all") santriQuery = santriQuery.eq("jenis_kelamin", gender);

    const { data: allSantri } = await santriQuery;

    // Initialize map with all santri
    type SantriRekap = {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
        jenis_kelamin: string;
    };
    const santriMap: Record<string, SantriRekap> = {};

    if (allSantri) {
        allSantri.forEach((s: any) => {
            santriMap[s.id] = {
                id: s.id,
                nama: s.nama,
                nis: s.nis,
                jenjang: s.jenjang,
                hadir: 0,
                izin: 0,
                sakit: 0,
                alpa: 0,
                jenis_kelamin: s.jenis_kelamin,
            };
        });
    }

    // 2. Get presensi data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: presensiData } = await (supabase as any)
        .from("presensi")
        .select(`
            *,
            kegiatan:kegiatan_id(id, nama)
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59");

    if (!presensiData) return { santriRekap: Object.values(santriMap), kegiatanCount: 0 };

    // 3. Update stats from presensi data and count unique filtered activities
    const uniqueKegiatan = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (presensiData as any[]).forEach((p) => {
        // Skip if not in our santri map (means didn't match initial filters)
        if (!santriMap[p.santri_id]) return;

        // Apply Kegiatan Name filter
        if (kegiatanName && p.kegiatan?.nama !== kegiatanName) return;

        // Count this activity
        uniqueKegiatan.add(p.kegiatan_id);

        const status = p.status as "hadir" | "izin" | "sakit" | "alpa";
        if (santriMap[p.santri_id][status] !== undefined) {
            santriMap[p.santri_id][status]++;
        }
    });

    const result = Object.values(santriMap);
    result.sort((a, b) => a.nama.localeCompare(b.nama));

    return {
        santriRekap: result,
        kegiatanCount: uniqueKegiatan.size,
    };
}

export async function getSantriForPresensi() {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang, jenis_kelamin, kelas_id, halaqoh_id")
        .eq("status", "aktif")
        .order("nama", { ascending: true });
    return data || [];
}

export async function getMyGroups() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { kelasId: null, halaqohId: null };

    // Get asatidz id linked to user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: asatidz } = await (supabase as any)
        .from("asatidz")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!asatidz) return { kelasId: null, halaqohId: null };

    // Check if wali kelas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kelas } = await (supabase as any)
        .from("kelas")
        .select("id")
        .eq("wali_kelas_id", asatidz.id)
        .single();

    // Check if musyrif
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: halaqoh } = await (supabase as any)
        .from("halaqoh")
        .select("id")
        .eq("musyrif_id", asatidz.id)
        .single();

    return {
        kelasId: kelas?.id || null,
        halaqohId: halaqoh?.id || null
    };
}

export async function getUserRole() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return (profile as any)?.role || "user";
}

// Get unique kegiatan names from database for rekap filter
export async function getUniqueKegiatanNames(): Promise<string[]> {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("kegiatan")
        .select("nama");

    if (error) {
        console.error("Error fetching kegiatan names:", error);
        return [];
    }

    // Get unique names
    const uniqueNames = [...new Set((data || []).map((k: { nama: string }) => k.nama))] as string[];
    return uniqueNames.sort();
}

// Multi-activity rekap: returns attendance per activity as columns
// mode: "all" = all activities except sholat, "sholat" = only recurring sholat activities
export async function getPresensiRekapMultiActivity(
    month?: number,
    year?: number,
    filterType: "all" | "kelas" | "halaqoh" = "all",
    filterId: string = "",
    gender: "L" | "P" | "all" = "all",
    mode: "all" | "sholat" = "all"
) {
    const supabase = await createClient();
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split("T")[0];

    // 1. Get all relevant santri
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let santriQuery = (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang, jenis_kelamin, kelas_id, halaqoh_id")
        .eq("status", "aktif")
        .order("nama", { ascending: true });

    if (filterType === "kelas" && filterId) santriQuery = santriQuery.eq("kelas_id", filterId);
    if (filterType === "halaqoh" && filterId) santriQuery = santriQuery.eq("halaqoh_id", filterId);
    if (gender !== "all") santriQuery = santriQuery.eq("jenis_kelamin", gender);

    const { data: allSantri } = await santriQuery;
    if (!allSantri || allSantri.length === 0) {
        return { santriRekap: [], activities: [], activityTotals: {} };
    }

    // 2. Get all presensi data with kegiatan info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: presensiData } = await (supabase as any)
        .from("presensi")
        .select(`
            *,
            kegiatan:kegiatan_id(id, nama)
        `)
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59");

    if (!presensiData) {
        return { santriRekap: [], activities: [], activityTotals: {} };
    }

    // 3. Count activity occurrences to identify recurring vs one-time
    const activityCount: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (presensiData as any[]).forEach((p) => {
        const actName = p.kegiatan?.nama;
        if (actName) {
            activityCount[actName] = (activityCount[actName] || 0) + 1;
        }
    });

    // 4. Filter activities based on mode
    const filteredActivities = Object.keys(activityCount).filter((name) => {
        const nameLower = name.toLowerCase();
        const isSholat = nameLower.includes("sholat") || nameLower.includes("solat") || nameLower.includes("shalat");
        const isRecurring = activityCount[name] > 5; // Heuristic: >5 occurrences = recurring

        if (mode === "sholat") {
            return isSholat && isRecurring;
        } else {
            return !isSholat; // "all" mode excludes sholat
        }
    }).sort();

    // 5. Build santri map with activity-based attendance
    type SantriMultiRekap = {
        id: string;
        nama: string;
        nis: string;
        jenjang: string;
        jenis_kelamin: string;
        activities: Record<string, { hadir: number; total: number }>;
    };

    const santriMap: Record<string, SantriMultiRekap> = {};
    const activityTotals: Record<string, number> = {};

    // Initialize santri map
    allSantri.forEach((s: any) => {
        santriMap[s.id] = {
            id: s.id,
            nama: s.nama,
            nis: s.nis,
            jenjang: s.jenjang,
            jenis_kelamin: s.jenis_kelamin,
            activities: {},
        };
        // Initialize each activity
        filteredActivities.forEach((act) => {
            santriMap[s.id].activities[act] = { hadir: 0, total: 0 };
        });
    });

    // Initialize activity totals
    filteredActivities.forEach((act) => {
        activityTotals[act] = 0;
    });

    // 6. Process presensi data - count unique kegiatan_id per activity name
    const kegiatanIdsByName: Record<string, Set<string>> = {};
    filteredActivities.forEach((act) => {
        kegiatanIdsByName[act] = new Set();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (presensiData as any[]).forEach((p) => {
        const actName = p.kegiatan?.nama;
        if (!actName || !filteredActivities.includes(actName)) return;
        if (!santriMap[p.santri_id]) return;

        // Track unique kegiatan instances
        kegiatanIdsByName[actName].add(p.kegiatan_id);

        // Count attendance
        santriMap[p.santri_id].activities[actName].total++;
        if (p.status === "hadir") {
            santriMap[p.santri_id].activities[actName].hadir++;
        }
    });

    // Calculate totals per activity (number of unique kegiatan instances)
    filteredActivities.forEach((act) => {
        activityTotals[act] = kegiatanIdsByName[act].size;
    });

    const result = Object.values(santriMap);
    result.sort((a, b) => a.nama.localeCompare(b.nama));

    return {
        santriRekap: result,
        activities: filteredActivities,
        activityTotals,
    };
}

