"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { KinerjaUstadzStat } from "./actions";

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: "Helvetica" },
    header: { marginBottom: 20, textAlign: "center", borderBottom: 1, paddingBottom: 10 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    subtitle: { fontSize: 12, color: "#555" },

    table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#000", marginTop: 10 },
    row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", minHeight: 24, alignItems: "center" },
    headerRow: { backgroundColor: "#f3f4f6", fontWeight: "bold" },

    // Columns
    colNo: { width: "5%", borderRightWidth: 1, padding: 4, fontSize: 10, textAlign: "center" },
    colName: { width: "25%", borderRightWidth: 1, padding: 4, fontSize: 10 },
    colGroup: { width: "20%", borderRightWidth: 1, padding: 4, fontSize: 10 },
    colStat: { width: "15%", borderRightWidth: 1, padding: 4, fontSize: 10, textAlign: "center" },
    colMissed: { width: "35%", padding: 4, fontSize: 9, color: "#ef4444" },

    footer: { marginTop: 30, fontSize: 10, textAlign: "right" },
});

export const KinerjaPdfDocument = ({
    data,
    month,
    year
}: {
    data: KinerjaUstadzStat[],
    month: number | string,
    year: number | string
}) => {
    const monthName = typeof month === 'number'
        ? format(new Date(2024, month - 1, 1), "MMMM", { locale: id })
        : month;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Laporan Kinerja Presensi Asatidz</Text>
                    <Text style={styles.subtitle}>Periode: {monthName} {year}</Text>
                </View>

                {/* Table Header */}
                <View style={[styles.table, styles.headerRow]}>
                    <View style={styles.row}>
                        <Text style={styles.colNo}>No</Text>
                        <Text style={styles.colName}>Nama Ustadz</Text>
                        <Text style={styles.colGroup}>Grup (Kelas/Halaqoh)</Text>
                        <Text style={styles.colStat}>Kehadiran</Text>
                        <Text style={styles.colMissed}>Absen Terlewat</Text>
                    </View>
                </View>

                {/* Table Body */}
                <View style={[styles.table, { borderTopWidth: 0 }]}>
                    {data.map((item, index) => (
                        <View key={item.ustadz_id} style={styles.row}>
                            <Text style={styles.colNo}>{index + 1}</Text>
                            <Text style={styles.colName}>{item.nama_ustadz}</Text>
                            <Text style={styles.colGroup}>{item.group_name} ({item.role_type})</Text>
                            <Text style={styles.colStat}>
                                {item.total_diisi}/{item.total_kegiatan} ({item.persentase}%)
                            </Text>
                            <Text style={styles.colMissed}>
                                {item.kegiatan_missed.length > 0
                                    ? item.kegiatan_missed.map(k => `${k.nama_kegiatan} (${format(new Date(k.tanggal), 'dd/MM')})`).join(", ").substring(0, 100)
                                    : "-"}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</Text>
                </View>
            </Page>
        </Document>
    );
};
