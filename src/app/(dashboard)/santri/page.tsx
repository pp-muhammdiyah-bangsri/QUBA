import { getSantriList } from "./actions";
import { getKelasDropdown, getHalaqohDropdown } from "../data-master/actions";
import { SantriTable } from "./santri-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

export default async function SantriPage() {
    const [santriList, kelasList, halaqohList] = await Promise.all([
        getSantriList(),
        getKelasDropdown(),
        getHalaqohDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Santri</h1>
                    <p className="text-gray-600">Kelola data santri Pondok Pesantren</p>
                </div>
                <Link href="/santri/import">
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Import Excel
                    </Button>
                </Link>
            </div>

            <SantriTable
                initialData={santriList}
                kelasList={kelasList}
                halaqohList={halaqohList}
            />
        </div>
    );
}