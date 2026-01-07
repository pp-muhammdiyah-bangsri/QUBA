import { getSantriDropdown, getSemesterOptions } from "../actions";
import { RapotViewer } from "./rapot-viewer";

export default async function RapotPage() {
    const [santriList, semesterOptions] = await Promise.all([
        getSantriDropdown(),
        getSemesterOptions(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapot</h1>
                <p className="text-gray-500 mt-1">
                    Lihat dan cetak rapot santri
                </p>
            </div>
            <RapotViewer santriList={santriList} semesterOptions={semesterOptions} />
        </div>
    );
}
