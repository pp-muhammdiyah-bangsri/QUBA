import { getKelasList } from "../actions";
import { getAsatidzDropdown as getAsatidz } from "../../akademik/actions";
import { KelasTable } from "./kelas-table";

export default async function KelasPage() {
    const [kelasList, asatidzList] = await Promise.all([
        getKelasList(),
        getAsatidz(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Kelas</h1>
                <p className="text-gray-500 mt-1">
                    Kelola kelas dan wali kelas untuk pengelompokan akademik
                </p>
            </div>
            <KelasTable initialData={kelasList} asatidzList={asatidzList} />
        </div>
    );
}
