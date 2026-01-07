"use server";

import { createClient } from "@/lib/supabase/server";

export type KinerjaUstadzStat = {
    ustadz_id: string; // Using musyrif or wali_kelas ID
    nama_ustadz: string;
    role_type: "Musyrif" | "Wali Kelas";
    group_name: string; // Halaqoh name or Kelas name
    total_kegiatan: number; // Scheduled activities
    total_diisi: number; // Activities with presensi count > 0
    persentase: number;
    kegiatan_missed: {
        nama_kegiatan: string;
        tanggal: string;
    }[];
};

export async function getLaporanKinerja(month?: number, year?: number) {
    const supabase = await createClient();
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split("T")[0];

    // 1. Get All Activities in Period linked to Routine (to know expected vs actual)
    // Only count activities that have passed (completed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kegiatanList } = await (supabase as any)
        .from("kegiatan")
        .select(`
            id, nama, tanggal_mulai, jadwal_rutin_id,
            jadwal:jadwal_rutin_id(*)
        `)
        .gte("tanggal_mulai", startDate)
        .lte("tanggal_mulai", endDate)
        .lt("tanggal_mulai", new Date().toISOString().split('T')[0]) // Only past/today activities? Or strictly past. Let's say <= today.
        .not("jadwal_rutin_id", "is", null);

    if (!kegiatanList || kegiatanList.length === 0) return [];

    // 2. Check Presensi Count for each Kegiatan
    const kegiatanIds = kegiatanList.map((k: any) => k.id);

    // Check which kegiatan has at least 1 presensi record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: presensiCheck } = await (supabase as any)
        .from("presensi")
        .select("kegiatan_id")
        .in("kegiatan_id", kegiatanIds);

    const filledKegiatanIds = new Set(presensiCheck?.map((p: any) => p.kegiatan_id));

    // 3. Map Activities to Ustadz Owner
    // We need to know WHO owns the schedule.
    // Schedules are linked to JadwalRutin.
    // But JadwalRutin doesn't explicitly say "Mustrif X". 
    // However, Groups (Halaqoh/Kelas) have owners. 
    // AND Presensi is filtered by Group.
    // WAIT. Automated schedules are general events (e.g. KBM Pagi for ALL classes).
    // Who is responsible? EACH Wali Kelas/Musyrif is responsible for THEIR group.

    // REVISED LOGIC:
    // This is trickier. "KBM Pagi" exists once in `kegiatan` table.
    // But 10 Wali Kelas must input attendance for their own class.
    // Current DB schema: `presensi` table links `santri_id` -> `kegiatan_id`.
    // So we can check: For a given `kegiatan` (KBM Pagi), did Santri from `Kelas 7A` have attendance?
    // If NO santri from 7A has attendance, then Wali Kelas 7A failed.

    // 3a. Get all Groups (Kelas & Halaqoh) and their Leaders
    const { data: kelas } = await supabase.from("kelas").select("id, nama, wali_kelas:wali_kelas_id(id, nama, jenis_kelamin)");
    const { data: halaqoh } = await supabase.from("halaqoh").select("id, nama, musyrif:musyrif_id(id, nama, jenis_kelamin)");

    // 3b. Build Stats Map
    const stats: Record<string, KinerjaUstadzStat> = {};

    // Init stats for Wali Kelas
    kelas?.forEach((k: any) => {
        if (k.wali_kelas) {
            const uid = k.wali_kelas.id;
            stats[uid] = {
                ustadz_id: uid,
                nama_ustadz: (k.wali_kelas.jenis_kelamin === "P" ? "Ustadzah " : "Ustadz ") + k.wali_kelas.nama,
                role_type: "Wali Kelas",
                group_name: k.nama,
                total_kegiatan: 0,
                total_diisi: 0,
                persentase: 0,
                kegiatan_missed: []
            };
        }
    });

    // Init stats for Musyrif
    halaqoh?.forEach((h: any) => {
        if (h.musyrif) {
            const uid = h.musyrif.id;
            stats[uid] = {
                ustadz_id: uid,
                nama_ustadz: (h.musyrif.jenis_kelamin === "P" ? "Ustadzah " : "Ustadz ") + h.musyrif.nama,
                role_type: "Musyrif",
                group_name: h.nama,
                total_kegiatan: 0,
                total_diisi: 0,
                persentase: 0,
                kegiatan_missed: []
            };
        }
    });

    // 4. Iterate Activities and Check Attendance per Group
    // Need to fetch ALL presensi for these activities to split by santri groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allPresensi } = await (supabase as any)
        .from("presensi")
        .select(`
            kegiatan_id,
            santri:santri_id(kelas_id, halaqoh_id)
        `)
        .in("kegiatan_id", kegiatanIds);

    // Map: KegiatanID -> Set<KelasID> & Set<HalaqohID> that have attended
    const attendanceMap: Record<string, { kelas: Set<string>, halaqoh: Set<string> }> = {};

    allPresensi?.forEach((p: any) => {
        const kid = p.kegiatan_id;
        if (!attendanceMap[kid]) attendanceMap[kid] = { kelas: new Set(), halaqoh: new Set() };

        if (p.santri?.kelas_id) attendanceMap[kid].kelas.add(p.santri.kelas_id);
        if (p.santri?.halaqoh_id) attendanceMap[kid].halaqoh.add(p.santri.halaqoh_id);
    });

    // 5. Calculate Compliance
    // Loop through all past activities.
    // Determine type: If School -> Check all Classes. If Dorm -> Check all Halaqohs.
    // How to distinguish? "JadwalRutin" doesn't have type yet.
    // Assumption: We check ALL groups for generic activities, or we imply from name/time?
    // BETTER: Let's assume ALL groups must report for ALL activities for now (High Standard).
    // OR: Check "hari_aktif".
    // Let's iterate all Groups.

    // For each Class
    kelas?.forEach((k: any) => {
        if (!k.wali_kelas) return;
        const s = stats[k.wali_kelas.id];

        kegiatanList.forEach((act: any) => {
            s.total_kegiatan++;
            // Check if this class has attendance for this activity
            if (attendanceMap[act.id]?.kelas.has(k.id)) {
                s.total_diisi++;
            } else {
                s.kegiatan_missed.push({
                    nama_kegiatan: act.nama,
                    tanggal: act.tanggal_mulai
                });
            }
        });
    });

    // For each Halaqoh
    halaqoh?.forEach((h: any) => {
        if (!h.musyrif) return;
        const s = stats[h.musyrif.id];

        kegiatanList.forEach((act: any) => {
            s.total_kegiatan++;
            if (attendanceMap[act.id]?.halaqoh.has(h.id)) {
                s.total_diisi++;
            } else {
                s.kegiatan_missed.push({
                    nama_kegiatan: act.nama,
                    tanggal: act.tanggal_mulai
                });
            }
        });
    });

    // Finalize Percentage
    Object.values(stats).forEach(s => {
        s.persentase = s.total_kegiatan > 0 ? Math.round((s.total_diisi / s.total_kegiatan) * 100) : 0;
    });

    return Object.values(stats).sort((a, b) => a.persentase - b.persentase); // Low compliance first
}
