import { getNilaiList, getSantriDropdown, getMapelDropdown, getSemesterOptions } from "../actions";
import { NilaiTable } from "./nilai-table";

export default async function NilaiInputPage() {
    const [nilaiData, santriList, mapelList, semesterOptions] = await Promise.all([
        getNilaiList(),
        getSantriDropdown(),
        getMapelDropdown(),
        getSemesterOptions(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Input Nilai</h1>
                <p className="text-gray-500 mt-1">
                    Input dan kelola nilai santri per mata pelajaran
                </p>
            </div>
            <NilaiTable
                initialData={nilaiData}
                santriList={santriList}
                mapelList={mapelList}
                semesterOptions={semesterOptions}
            />
        </div>
    );
}
