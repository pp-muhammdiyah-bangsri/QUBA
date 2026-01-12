"use server";

import { createClient } from "@/lib/supabase/server";

export async function getLaporanData(santriId: string, month: number, year: number) {
    const supabase = await createClient();

    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    // Get santri info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("*")
        .eq("id", santriId)
        .single();

    // Get Musyrif info
    let musyrifNama = "";
    let musyrifJenisKelamin = "";
    if (santri?.halaqoh_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: halaqoh } = await (supabase as any)
            .from("halaqoh")
            .select("musyrif:musyrif_id(nama, jenis_kelamin)")
            .eq("id", santri.halaqoh_id)
            .single();

        if (halaqoh?.musyrif) {
            const prefix = halaqoh.musyrif.jenis_kelamin === "P" ? "Ustadzah " : "Ustadz ";
            musyrifNama = prefix + halaqoh.musyrif.nama;
            musyrifJenisKelamin = halaqoh.musyrif.jenis_kelamin;
        }
    }

    // Get hafalan lembar for the month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hafalanLembar } = await (supabase as any)
        .from("hafalan_lembar")
        .select("*")
        .eq("santri_id", santriId)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate);

    // Get hafalan tasmi for the month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hafalanTasmi } = await (supabase as any)
        .from("hafalan_tasmi")
        .select("*")
        .eq("santri_id", santriId)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate);

    // Get presensi for the month with kegiatan info for categorization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: presensiData } = await (supabase as any)
        .from("presensi")
        .select("status, created_at, kegiatan:kegiatan_id(id, nama)")
        .eq("santri_id", santriId)
        .gte("created_at", startDate)
        .lte("created_at", endDate + "T23:59:59");

    // Categorize presensi by activity type
    // Track unique kegiatan per category to count total opportunities
    const categoryData = {
        sholat: { hadir: 0, total: 0, kegiatanIds: new Set<string>() },
        kbm: { hadir: 0, total: 0, kegiatanIds: new Set<string>() },
        halaqoh: { hadir: 0, total: 0, kegiatanIds: new Set<string>() },
        lainnya: { hadir: 0, total: 0, kegiatanIds: new Set<string>() },
    };

    // Helper to categorize activity by name
    const categorizeActivity = (nama: string): keyof typeof categoryData => {
        const normalized = nama.toLowerCase().replace(/[''`]/g, "");

        // Check for Sholat keywords
        if (
            normalized.includes("sholat") ||
            normalized.includes("solat") ||
            normalized.includes("shalat") ||
            normalized.includes("qobliah") ||
            normalized.includes("qabliah") ||
            normalized.includes("badiah") ||
            normalized.includes("badiyah") ||
            normalized.includes("subuh") ||
            normalized.includes("dzuhur") ||
            normalized.includes("ashar") ||
            normalized.includes("maghrib") ||
            normalized.includes("isya") ||
            normalized.includes("tahajud") ||
            normalized.includes("duha") ||
            normalized.includes("witir") ||
            normalized.includes("syuruq")
        ) {
            return "sholat";
        }

        // Check for KBM
        if (normalized.includes("kbm")) {
            return "kbm";
        }

        // Check for Halaqoh
        if (normalized.includes("halaqoh") || normalized.includes("halaqah")) {
            return "halaqoh";
        }

        // Default to lainnya
        return "lainnya";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (presensiData as any[])?.forEach((p: { status: string; kegiatan: { id: string; nama: string } | null }) => {
        if (!p.kegiatan) return;

        const category = categorizeActivity(p.kegiatan.nama);
        const kegiatanId = p.kegiatan.id;

        // Track unique kegiatan for total count
        if (!categoryData[category].kegiatanIds.has(kegiatanId)) {
            categoryData[category].kegiatanIds.add(kegiatanId);
            categoryData[category].total++;
        }

        // Count hadir
        if (p.status === "hadir") {
            categoryData[category].hadir++;
        }
    });

    // Build categorized presensi result (without Set for serialization)
    const presensiCategorized = {
        sholat: { hadir: categoryData.sholat.hadir, total: categoryData.sholat.total },
        kbm: { hadir: categoryData.kbm.hadir, total: categoryData.kbm.total },
        halaqoh: { hadir: categoryData.halaqoh.hadir, total: categoryData.halaqoh.total },
        lainnya: { hadir: categoryData.lainnya.hadir, total: categoryData.lainnya.total },
    };

    // Get pelanggaran for the month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pelanggaran } = await (supabase as any)
        .from("pelanggaran")
        .select("*")
        .eq("santri_id", santriId)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate);

    // Get perizinan for the month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: perizinan } = await (supabase as any)
        .from("perizinan")
        .select("*")
        .eq("santri_id", santriId)
        .gte("tgl_mulai", startDate)
        .lte("tgl_mulai", endDate);

    return {
        santri: santri || null,
        musyrif_nama: musyrifNama,
        musyrif_jenis_kelamin: musyrifJenisKelamin,
        month,
        year,
        hafalan: {
            lembar: hafalanLembar || [],
            tasmi: hafalanTasmi || [],
        },
        presensi: presensiCategorized,
        pelanggaran: pelanggaran || [],
        perizinan: perizinan || [],
    };
}

export async function getSantriDropdown() {
    const supabase = await createClient();

    // 1. Check User Role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const role = (profile as any)?.role || "user";

    // 2. Base Query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
        .from("santri")
        .select("id, nama, nis, jenjang")
        .eq("status", "aktif")
        .order("nama", { ascending: true });

    // 3. Apply Restriction for Ustadz
    if (role !== "admin") {
        // Get Asatidz ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: asatidz } = await (supabase as any)
            .from("asatidz")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!asatidz) return []; // Ustadz not found

        // Get Assigned Groups
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: kelas } = await (supabase as any)
            .from("kelas")
            .select("id")
            .eq("wali_kelas_id", asatidz.id)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: halaqoh } = await (supabase as any)
            .from("halaqoh")
            .select("id")
            .eq("musyrif_id", asatidz.id)
            .single();

        const conditions = [];
        if (kelas) conditions.push(`kelas_id.eq.${kelas.id}`);
        if (halaqoh) conditions.push(`halaqoh_id.eq.${halaqoh.id}`);

        if (conditions.length > 0) {
            query = query.or(conditions.join(","));
        } else {
            return []; // No groups assigned
        }
    }

    const { data } = await query;
    return data || [];
}

export async function getMonthOptions() {
    return [
        { value: 1, label: "Januari" },
        { value: 2, label: "Februari" },
        { value: 3, label: "Maret" },
        { value: 4, label: "April" },
        { value: 5, label: "Mei" },
        { value: 6, label: "Juni" },
        { value: 7, label: "Juli" },
        { value: 8, label: "Agustus" },
        { value: 9, label: "September" },
        { value: 10, label: "Oktober" },
        { value: 11, label: "November" },
        { value: 12, label: "Desember" },
    ];
}

export async function getYearOptions() {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
}
