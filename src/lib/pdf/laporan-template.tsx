"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Times-Roman",
        fontSize: 10,
        backgroundColor: "#ffffff"
    },
    // Header
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 5,
        borderBottomWidth: 3,
        borderBottomColor: "#15803d",
        paddingBottom: 5,
    },
    logoBox: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    logoImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    headerContent: {
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
    },
    headerTitleMain: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
        color: "#15803d",
        textTransform: "uppercase",
    },
    headerTitleSub: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 2,
    },
    headerAddress: {
        fontSize: 9,
        fontStyle: "italic",
        color: "#525252",
    },
    // Title
    reportTitle: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 5,
        marginBottom: 10,
        textDecoration: "underline",
    },
    // Top Section
    topSection: {
        flexDirection: "row",
        marginBottom: 10,
        gap: 10,
    },
    // Profile
    profileBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
        padding: 5,
    },
    profileContent: {
        flexDirection: "row",
        gap: 12, // Increased gap
    },
    photoBox: {
        width: 70, // Increased from 50
        height: 88, // Increased from 60 (approx 4x5 ratio)
        backgroundColor: "#f5f5f5",
        borderRadius: 3,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    photoImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    profileInfo: {
        flex: 1,
        justifyContent: "center",
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 4,
        alignItems: "flex-start", // Align top for multi-line text
    },
    infoLabel: {
        width: 60, // Increased width for labels
        fontSize: 9,
        color: "#525252",
    },
    infoValue: {
        flex: 1,
        fontSize: 10, // Increased font size slightly
        fontWeight: "bold",
        flexWrap: "wrap", // Ensure wrapping
    },
    // Stats
    statsBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 4,
        padding: 5,
    },
    sectionLabel: {
        fontSize: 9,
        fontWeight: "bold",
        marginBottom: 6,
        color: "#15803d",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingBottom: 2,
    },
    // Attendance Grid
    attendanceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
    },
    attCard: {
        width: "47%",
        padding: 5,
        borderRadius: 3,
        alignItems: "center",
    },
    attLabel: { fontSize: 8, marginTop: 1 },
    attValue: { fontSize: 10, fontWeight: "bold" },

    // Table Generic
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 8,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#15803d",
        padding: 4,
    },
    tableHeaderCell: {
        color: "#ffffff",
        fontSize: 8,
        fontWeight: "bold",
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        padding: 3,
        alignItems: "center",
        minHeight: 20,
    },
    tableCell: {
        fontSize: 8,
        textAlign: "center",
        justifyContent: "center",
    },

    // Progress Bar
    progressContainer: {
        width: "100%",
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 2,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#166534",
    },

    // Footer
    footerSection: {
        marginTop: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 5,
    },
    signatureBox: {
        width: 150,
        alignItems: "center",
    },
    signatureLine: {
        marginTop: 30, // Reduced spacing
        borderTopWidth: 1,
        borderTopColor: "#000",
        width: "100%",
        textAlign: "center",
        paddingTop: 2,
        fontSize: 8,
        fontWeight: "bold",
    }
});

interface LaporanPDFProps {
    data: {
        monthName: string;
        year: number;
        santri: {
            nama: string;
            nis: string;
            jenjang: string;
            jenis_kelamin: string;
            kelas?: string;
            foto_url?: string | null;
        } | null;
        hafalan: {
            lembar: { tanggal: string; juz: number; lembar: string }[];
            tasmi: { tanggal: string; juz: number; nilai: number | null; predikat?: string }[];
        };
        presensi: { hadir: number; izin: number; sakit: number; alpa: number };
        pelanggaran: { tanggal: string; deskripsi: string; poin: number | null; penyelesaian?: string | null }[];
        musyrif_nama: string;
        musyrif_jenis_kelamin: string;
    }
}

const truncateName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length <= 2) return name;
    // Take first 2 words + initials of the rest
    const mainParts = parts.slice(0, 2).join(" ");
    const initials = parts.slice(2).map(p => p.charAt(0).toUpperCase() + ".").join("");
    return `${mainParts} ${initials}`;
};

export function LaporanPDFDocument({ data }: LaporanPDFProps) {
    const violationCount = data.pelanggaran.length;

    // Limit to 5 most recent
    const recentHafalan = data.hafalan.lembar.slice(0, 5);
    const hasMoreHafalan = data.hafalan.lembar.length > 5;

    // Sort Violations by Points Descending and take top 3
    const topPelanggaran = [...data.pelanggaran]
        .sort((a, b) => (b.poin ?? 0) - (a.poin ?? 0))
        .slice(0, 3);
    const hasMorePelanggaran = data.pelanggaran.length > 3;

    // -- PHOTO LOGIC --
    // Gender-based fallback
    const MALE_AVATAR = "https://avatar.iran.liara.run/public/boy";
    const FEMALE_AVATAR = "https://avatar.iran.liara.run/public/girl";

    const photoSrc = data.santri?.foto_url || (data.santri?.jenis_kelamin === "L" ? MALE_AVATAR : FEMALE_AVATAR);

    // -- PROGRESS LOGIC --
    const progressByJuz = new Map<string, { uniqueLembar: Set<string>, activeDays: Set<string> }>();

    data.hafalan.lembar.forEach(entry => {
        const juzKey = entry.juz.toString();
        if (!progressByJuz.has(juzKey)) {
            progressByJuz.set(juzKey, { uniqueLembar: new Set(), activeDays: new Set() });
        }
        const record = progressByJuz.get(juzKey)!;
        record.uniqueLembar.add(entry.lembar);
        record.activeDays.add(entry.tanggal);
    });

    const progressRows = Array.from(progressByJuz.entries()).map(([juz, stats]) => {
        const totalLembar = stats.uniqueLembar.size;
        const percentage = Math.min(Math.round((totalLembar / 10) * 100), 100);

        return {
            juz,
            capaian: `${totalLembar} Lembar (${totalLembar * 2} Hal)`,
            durasi: `${stats.activeDays.size} Hari`,
            percentage
        };
    }).sort((a, b) => parseInt(a.juz) - parseInt(b.juz));

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoBox}>
                        <Image src="/logo_kiri.jpg" style={styles.logoImage} />
                    </View>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitleMain}>PONDOK PESANTREN MUHAMMADIYAH BANGSRI</Text>
                        <Text style={styles.headerTitleSub}>MBS QUBA DAN LKSA MUSTADL&apos;AFIN</Text>
                        <Text style={styles.headerAddress}>Jl. Seroja No.04 Kauman rt.01 rw.09 Bangsri Jepara</Text>
                    </View>
                    <View style={styles.logoBox}>
                        <Image src="/logo_kanan.jpg" style={styles.logoImage} />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.reportTitle}>LAPORAN PERKEMBANGAN SANTRI</Text>
                <Text style={{ textAlign: 'center', fontSize: 10, marginBottom: 15 }}>Periode: {data.monthName} {data.year}</Text>

                {/* Top Section */}
                <View style={styles.topSection}>
                    <View style={styles.profileBox}>
                        <Text style={styles.sectionLabel}>DATA SANTRI</Text>
                        <View style={styles.profileContent}>
                            {/* Photo */}
                            <View style={styles.photoBox}>
                                <Image src={photoSrc} style={styles.photoImage} />
                            </View>
                            {/* Info */}
                            <View style={styles.profileInfo}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Nama</Text>
                                    <Text style={styles.infoValue}>: {data.santri?.nama ? truncateName(data.santri.nama) : "-"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>NIS</Text>
                                    <Text style={styles.infoValue}>: {data.santri?.nis}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Jenjang</Text>
                                    <Text style={styles.infoValue}>: {data.santri?.jenjang}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Kelas</Text>
                                    <Text style={styles.infoValue}>: {data.santri?.kelas || "-"}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsBox}>
                        <Text style={styles.sectionLabel}>REKAP KEHADIRAN</Text>
                        <View style={styles.attendanceGrid}>
                            <View style={[styles.attCard, { backgroundColor: '#dcfce7' }]}>
                                <Text style={[styles.attValue, { color: '#166534' }]}>{data.presensi.hadir}</Text>
                                <Text style={styles.attLabel}>Hadir</Text>
                            </View>
                            <View style={[styles.attCard, { backgroundColor: '#fef9c3' }]}>
                                <Text style={[styles.attValue, { color: '#854d0e' }]}>{data.presensi.sakit}</Text>
                                <Text style={styles.attLabel}>Sakit</Text>
                            </View>
                            <View style={[styles.attCard, { backgroundColor: '#dbeafe' }]}>
                                <Text style={[styles.attValue, { color: '#1e40af' }]}>{data.presensi.izin}</Text>
                                <Text style={styles.attLabel}>Izin</Text>
                            </View>
                            <View style={[styles.attCard, { backgroundColor: '#fee2e2' }]}>
                                <Text style={[styles.attValue, { color: '#b91c1c' }]}>{data.presensi.alpa}</Text>
                                <Text style={styles.attLabel}>Alpa</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Hafalan Progress */}
                <View>
                    <Text style={[styles.sectionLabel, { marginBottom: 3 }]}>PROGRES HAFALAN</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Juz</Text>
                            <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Capaian</Text>
                            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Durasi</Text>
                            <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Progress</Text>
                        </View>
                        {progressRows.length > 0 ? progressRows.map((row, i) => (
                            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }]}>
                                <Text style={[styles.tableCell, { width: '15%', fontWeight: 'bold' }]}>Juz {row.juz}</Text>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{row.capaian}</Text>
                                <Text style={[styles.tableCell, { width: '25%' }]}>{row.durasi}</Text>
                                <View style={[styles.tableCell, { width: '30%', paddingHorizontal: 5 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
                                        <Text style={{ fontSize: 8 }}>{row.percentage}%</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <View style={[styles.progressBar, { width: `${row.percentage}%` }]} />
                                    </View>
                                </View>
                            </View>
                        )) : (
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '100%', padding: 5, fontStyle: 'italic', color: '#9ca3af' }]}>Belum ada data progres hafalan bulan ini.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Recent Hafalan Table */}
                <View>
                    <Text style={[styles.sectionLabel, { marginBottom: 3 }]}>RIWAYAT SETORAN (5 Terakhir)</Text>
                    {recentHafalan.length > 0 ? (
                        <View style={[styles.table, { marginBottom: 3 }]}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Tanggal</Text>
                                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Juz</Text>
                                <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Lembar/Halaman</Text>
                            </View>
                            {recentHafalan.map((h, i) => (
                                <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }]}>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>
                                        {new Date(h.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </Text>
                                    <Text style={[styles.tableCell, { width: '20%' }]}>{h.juz}</Text>
                                    <Text style={[styles.tableCell, { width: '50%' }]}>{h.lembar}</Text>
                                </View>
                            ))}
                            {hasMoreHafalan && (
                                <View style={[styles.tableRow, { justifyContent: 'center', backgroundColor: '#fafafa' }]}>
                                    <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#525252' }}>
                                        * Masih ada riwayat setoran lain, cek di aplikasi QUBA
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 8, color: '#525252' }}>Belum ada setoran bulan ini.</Text>
                    )}
                </View>

                {/* Tasmi Table */}
                <View>
                    <Text style={[styles.sectionLabel, { marginBottom: 3 }]}>PENCAPAIAN TASMI'</Text>
                    <View style={[styles.table, { marginBottom: 5 }]}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Tanggal</Text>
                            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Juz</Text>
                            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Nilai</Text>
                            <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Predikat</Text>
                        </View>
                        {data.hafalan.tasmi.length > 0 ? (
                            data.hafalan.tasmi.map((t, i) => (
                                <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }]}>
                                    <Text style={[styles.tableCell, { width: '25%' }]}>
                                        {new Date(t.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </Text>
                                    <Text style={[styles.tableCell, { width: '20%' }]}>{t.juz}</Text>
                                    <Text style={[styles.tableCell, { width: '25%' }]}>{t.nilai || "-"}</Text>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>{t.predikat || "-"}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '100%', padding: 5, fontStyle: 'italic', color: '#525252' }]}>Tidak ada data tasmi' pada bulan ini</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Violation Table (Limited to Top 3) */}
                <View>
                    <Text style={[styles.sectionLabel, { marginBottom: 3, color: violationCount > 0 ? '#dc2626' : '#15803d' }]}>CATATAN PELANGGARAN (3 Terberat)</Text>
                    <View style={[styles.table, { borderColor: violationCount > 0 ? '#fca5a5' : '#e5e7eb' }]}>
                        <View style={[styles.tableHeader, { backgroundColor: violationCount > 0 ? '#b91c1c' : '#15803d' }]}>
                            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Tanggal</Text>
                            <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Detail Pelanggaran</Text>
                            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Poin</Text>
                        </View>
                        {topPelanggaran.length > 0 ? (
                            <>
                                {topPelanggaran.map((p, i) => (
                                    <View key={i} style={[styles.tableRow, { backgroundColor: '#fef2f2' }]}>
                                        <Text style={[styles.tableCell, { width: '25%' }]}>
                                            {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                        </Text>
                                        <Text style={[styles.tableCell, { width: '50%', textAlign: 'left', paddingHorizontal: 5 }]}>{p.deskripsi}</Text>
                                        <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold', color: '#dc2626' }]}>{p.poin}</Text>
                                    </View>
                                ))}
                                {hasMorePelanggaran && (
                                    <View style={[styles.tableRow, { justifyContent: 'center', backgroundColor: '#fef2f2' }]}>
                                        <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#dc2626' }}>
                                            * Masih ada catatan pelanggaran lain, cek di aplikasi QUBA
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: '100%', padding: 5, fontStyle: 'italic', color: '#166534' }]}>Alhamdulillah, tidak ada catatan pelanggaran bulan ini.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer Signatures */}
                {/* Footer Signatures */}
                <View style={styles.footerSection}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 8, marginBottom: 2 }}>Mengetahui,</Text>
                        <Text style={{ fontSize: 8, marginBottom: 20 }}>Mudir Ponpes Muhammadiyah Bangsri</Text>
                        <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 2 }}>{" "}</Text>
                        <Text style={[styles.signatureLine, { borderTopWidth: 0, textDecoration: 'underline' }]}>
                            H. Aris Bastian, S.Pt.
                        </Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 2 }}>Jepara, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</Text>
                        <Text style={{ fontSize: 8, marginBottom: 25 }}>
                            {data.musyrif_jenis_kelamin === "P" ? "Musyrifah" : "Musyrif"} Halaqoh
                        </Text>
                        <Text style={[styles.signatureLine, { borderTopWidth: 0, textDecoration: 'underline' }]}>
                            {data.musyrif_nama || "..........................."}
                        </Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}
