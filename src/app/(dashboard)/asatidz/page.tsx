import { getAsatidzList } from "./actions";
import { AsatidzTable } from "./asatidz-table";

export default async function AsatidzPage() {
    const asatidzList = await getAsatidzList();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Asatidz</h1>
                    <p className="text-gray-600">Kelola data ustadz/ustadzah Pondok Pesantren</p>
                </div>
            </div>

            <AsatidzTable initialData={asatidzList} />
        </div>
    );
}