import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
    },
    header: {
        marginBottom: 20,
        textAlign: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 11,
        color: "#666666",
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row",
    },
    tableCol: {
        width: "14%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableColWide: {
        width: "30%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableColDynamic: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCellHeader: {
        margin: 5,
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
    },
    tableCell: {
        margin: 5,
        fontSize: 8,
        textAlign: "center",
    },
    tableCellLeft: {
        margin: 5,
        fontSize: 8,
        textAlign: "left",
    },
});

interface SantriRekap {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
}

interface SantriMultiRekap {
    id: string;
    nama: string;
    nis: string;
    jenjang: string;
    jenis_kelamin: string;
    activities: Record<string, { hadir: number; total: number }>;
}

interface RekapPdfProps {
    data: SantriRekap[];
    month: string;
    year: string;
    kegiatan: string;
    gender: string;
    filterType?: string;
    groupName?: string;
}

interface RekapPdfMultiProps {
    data: SantriMultiRekap[];
    activities: string[];
    activityTotals: Record<string, number>;
    month: string;
    year: string;
    gender: string;
    isSholat: boolean;
    filterType?: string;
    groupName?: string;
}

// Single Activity PDF (Hadir/Izin/Sakit/Alpha format)
export const RekapPdfDocument = ({ data, month, year, kegiatan, gender, filterType, groupName }: RekapPdfProps) => {
    const monthName = new Date(0, parseInt(month) - 1).toLocaleString("id-ID", { month: "long" });

    // Build dynamic title
    let genderSuffix = "";
    if (gender === "L") genderSuffix = " Putra";
    if (gender === "P") genderSuffix = " Putri";

    let groupSuffix = "";
    if (filterType && filterType !== "all" && groupName) {
        groupSuffix = ` ${groupName}`;
    }

    const title = `Rekap Presensi ${kegiatan} Santri${genderSuffix}${groupSuffix}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>
                        Periode: {monthName} {year}
                    </Text>
                </View>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColWide}>
                            <Text style={styles.tableCellHeader}>Nama Santri</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Jenjang</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Hadir</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Izin</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Sakit</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCellHeader}>Alpa</Text>
                        </View>
                    </View>

                    {/* Table Rows */}
                    {data.map((row) => (
                        <View style={styles.tableRow} key={row.id}>
                            <View style={styles.tableColWide}>
                                <Text style={styles.tableCellLeft}>{row.nama}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{row.jenjang}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{row.hadir}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{row.izin}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{row.sakit}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{row.alpa}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

// Multi Activity PDF (columns per activity with hadir/total format)
export const RekapPdfMultiDocument = ({
    data,
    activities,
    activityTotals,
    month,
    year,
    gender,
    isSholat,
    filterType,
    groupName
}: RekapPdfMultiProps) => {
    const monthName = new Date(0, parseInt(month) - 1).toLocaleString("id-ID", { month: "long" });

    // Build dynamic title
    let genderSuffix = "";
    if (gender === "L") genderSuffix = " Putra";
    if (gender === "P") genderSuffix = " Putri";

    let groupSuffix = "";
    if (filterType && filterType !== "all" && groupName) {
        groupSuffix = ` ${groupName}`;
    }

    let title = "";
    if (isSholat) {
        title = `Rekap Presensi Sholat Santri${genderSuffix}${groupSuffix}`;
    } else {
        title = `Rekap Presensi Seluruh Kegiatan Santri${genderSuffix}${groupSuffix}`;
    }

    // Calculate attendance stats if isSholat
    const statsWidth = isSholat ? 12 : 0; // 6% for Total, 6% for %

    // Calculate dynamic column width
    const nameWidth = 20; // percentage
    const jenjangWidth = 8;
    const remainingWidth = 100 - nameWidth - jenjangWidth - statsWidth;
    const activityWidth = activities.length > 0 ? remainingWidth / activities.length : 10;

    // Use landscape for many columns or if it is sholat report
    const orientation = activities.length > 5 || isSholat ? "landscape" : "portrait";

    return (
        <Document>
            <Page size="A4" orientation={orientation} style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>
                        Periode: {monthName} {year}
                    </Text>
                </View>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColDynamic, { width: `${nameWidth}%` }]}>
                            <Text style={styles.tableCellHeader}>Nama</Text>
                        </View>
                        <View style={[styles.tableColDynamic, { width: `${jenjangWidth}%` }]}>
                            <Text style={styles.tableCellHeader}>Jenjang</Text>
                        </View>
                        {activities.map((act) => (
                            <View key={act} style={[styles.tableColDynamic, { width: `${activityWidth}%` }]}>
                                <Text style={styles.tableCellHeader}>{act}</Text>
                            </View>
                        ))}
                        {isSholat && (
                            <>
                                <View style={[styles.tableColDynamic, { width: "6%" }]}>
                                    <Text style={styles.tableCellHeader}>Hadir</Text>
                                </View>
                                <View style={[styles.tableColDynamic, { width: "6%" }]}>
                                    <Text style={styles.tableCellHeader}>%</Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Table Rows */}
                    {data.map((row) => (
                        <View style={styles.tableRow} key={row.id}>
                            <View style={[styles.tableColDynamic, { width: `${nameWidth}%` }]}>
                                <Text style={styles.tableCellLeft}>{row.nama}</Text>
                            </View>
                            <View style={[styles.tableColDynamic, { width: `${jenjangWidth}%` }]}>
                                <Text style={styles.tableCell}>{row.jenjang}</Text>
                            </View>
                            {activities.map((act) => {
                                const stats = row.activities[act] || { hadir: 0, total: 0 };
                                const total = activityTotals[act] || stats.total;
                                return (
                                    <View key={act} style={[styles.tableColDynamic, { width: `${activityWidth}%` }]}>
                                        <Text style={styles.tableCell}>{stats.hadir}/{total}</Text>
                                    </View>
                                );
                            })}

                            {isSholat && (() => {
                                let totalHadir = 0;
                                let totalKegiatan = 0;
                                activities.forEach(act => {
                                    const stats = row.activities[act] || { hadir: 0, total: 0 };
                                    const total = activityTotals[act] || stats.total;
                                    totalHadir += stats.hadir;
                                    totalKegiatan += total;
                                });
                                const percentage = totalKegiatan > 0 ? Math.round((totalHadir / totalKegiatan) * 100) : 0;

                                return (
                                    <>
                                        <View style={[styles.tableColDynamic, { width: "6%" }]}>
                                            <Text style={styles.tableCell}>{totalHadir}/{totalKegiatan}</Text>
                                        </View>
                                        <View style={[styles.tableColDynamic, { width: "6%" }]}>
                                            <Text style={styles.tableCell}>{percentage}%</Text>
                                        </View>
                                    </>
                                );
                            })()}
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};
