import { getPresensiRekap, getUniqueKegiatanNames, getPresensiRekapMultiActivity } from "@/app/(dashboard)/presensi/actions";
import { getKelasDropdown, getHalaqohDropdown } from "@/app/(dashboard)/data-master/actions";
import { RekapTable } from "./rekap-table";

export default async function RekapPresensiPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const month = Number(params.month) || new Date().getMonth() + 1;
    const year = Number(params.year) || new Date().getFullYear();
    const filterType = (params.type as "all" | "kelas" | "halaqoh") || "all";
    const filterId = (params.id as string) || "";
    const kegiatanName = (params.kegiatan as string) || "";
    const gender = (params.gender as "L" | "P" | "all") || "all";

    // Determine which data to fetch based on kegiatan filter
    const isMultiMode = kegiatanName === "" || kegiatanName === "__SHOLAT__";
    const multiMode = kegiatanName === "__SHOLAT__" ? "sholat" : "all";

    const [rekapData, multiRekapData, kelasList, halaqohList, kegiatanList] = await Promise.all([
        // Single activity mode (for specific kegiatan)
        isMultiMode ? Promise.resolve({ santriRekap: [], kegiatanCount: 0 }) : getPresensiRekap(month, year, filterType, filterId, kegiatanName, gender),
        // Multi-activity mode (for "semua" or "sholat")
        isMultiMode ? getPresensiRekapMultiActivity(month, year, filterType, filterId, gender, multiMode as "all" | "sholat") : Promise.resolve({ santriRekap: [], activities: [], activityTotals: {} }),
        getKelasDropdown(),
        getHalaqohDropdown(),
        getUniqueKegiatanNames(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rekap Presensi</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Laporan kehadiran santri bulanan
                </p>
            </div>

            <RekapTable
                data={rekapData.santriRekap}
                multiData={multiRekapData.santriRekap}
                activities={multiRekapData.activities}
                activityTotals={multiRekapData.activityTotals}
                totalKegiatan={rekapData.kegiatanCount}
                kelasList={kelasList}
                halaqohList={halaqohList}
                kegiatanList={kegiatanList}
                isMultiMode={isMultiMode}
            />
        </div>
    );
}
