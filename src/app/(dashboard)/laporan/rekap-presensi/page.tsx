import { getPresensiRekap } from "@/app/(dashboard)/presensi/actions";
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

    const [rekapData, kelasList, halaqohList] = await Promise.all([
        getPresensiRekap(month, year, filterType, filterId, kegiatanName, gender),
        getKelasDropdown(),
        getHalaqohDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Rekap Presensi</h1>
                <p className="text-gray-500 mt-1">
                    Laporan kehadiran santri bulanan
                </p>
            </div>

            <RekapTable
                data={rekapData.santriRekap}
                totalKegiatan={rekapData.kegiatanCount}
                kelasList={kelasList}
                halaqohList={halaqohList}
            />
        </div>
    );
}
