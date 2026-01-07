import { getHalaqohList } from "../actions";
import { getAsatidzDropdown } from "../../akademik/actions";
import { HalaqohTable } from "./halaqoh-table";

export default async function HalaqohPage() {
    const [halaqohList, asatidzList] = await Promise.all([
        getHalaqohList(),
        getAsatidzDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Halaqoh</h1>
                <p className="text-gray-500 mt-1">
                    Kelola halaqoh dan musyrif untuk pengelompokan asrama/mengaji
                </p>
            </div>
            <HalaqohTable initialData={halaqohList} asatidzList={asatidzList} />
        </div>
    );
}
