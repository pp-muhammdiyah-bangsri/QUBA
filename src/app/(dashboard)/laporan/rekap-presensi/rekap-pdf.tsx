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
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
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
    tableCellHeader: {
        margin: 5,
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
    },
    tableCell: {
        margin: 5,
        fontSize: 9,
        textAlign: "center",
    },
    tableCellLeft: {
        margin: 5,
        fontSize: 9,
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

interface RekapPdfProps {
    data: SantriRekap[];
    month: string;
    year: string;
    kegiatan: string;
    gender: string;
}

export const RekapPdfDocument = ({ data, month, year, kegiatan, gender }: RekapPdfProps) => {
    const monthName = new Date(0, parseInt(month) - 1).toLocaleString("id-ID", { month: "long" });

    let suffix = "";
    if (gender === "L") suffix = " Putra";
    if (gender === "P") suffix = " Putri";

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Rekap Presensi {kegiatan ? kegiatan + " " : ""}Santri{suffix}
                    </Text>
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
