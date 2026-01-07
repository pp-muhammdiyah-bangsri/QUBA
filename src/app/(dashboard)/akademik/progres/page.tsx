import { getAllSantriProgressSummary, getSantriDropdown } from "../actions";
import { ProgressView } from "./progress-view";

export default async function ProgressPage() {
    const [progressData, santriList] = await Promise.all([
        getAllSantriProgressSummary(),
        getSantriDropdown(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Progres Hafalan</h1>
                <p className="text-gray-500 mt-1">
                    Visualisasi kemajuan hafalan seluruh santri
                </p>
            </div>
            <ProgressView initialData={progressData} santriList={santriList} />
        </div>
    );
}
