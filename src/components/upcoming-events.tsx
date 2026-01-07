import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

export interface EventItem {
    id: string | number;
    nama: string;
    tanggal: string;
    lokasi: string;
    jenis: string;
}

export function UpcomingEvents({ events = [] }: { events?: EventItem[] }) {
    if (!events.length) {
        return <p className="text-gray-500 text-sm">Tidak ada event mendatang.</p>;
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{event.nama}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{event.tanggal}</span>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {event.lokasi || "Online/TBA"}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}