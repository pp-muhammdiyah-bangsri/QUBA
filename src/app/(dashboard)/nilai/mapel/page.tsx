import { getMapelList } from "../actions";
import { MapelTable } from "./mapel-table";

export default async function MapelPage() {
    const mapelData = await getMapelList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran</h1>
                <p className="text-gray-500 mt-1">
                    Kelola daftar mata pelajaran dan KKM
                </p>
            </div>
            <MapelTable initialData={mapelData} />
        </div>
    );
}
