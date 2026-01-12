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
        return <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4 text-center">Tidak ada event mendatang.</p>;
    }

    return (
        <div className="space-y-4">
            {events.map((event) => {
                // Parse "12 Januari 2024" format if provided, or fallback
                // Assuming format from getAdminExtraData: "d MMMM yyyy"
                const parts = event.tanggal.split(' ');
                const day = parts.length > 0 ? parts[0] : new Date().getDate();
                const month = parts.length > 1 ? parts[1].substring(0, 3) : "TBA";

                return (
                    <div
                        key={event.id}
                        className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-100/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                        {/* Calendar Leaf */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300 overflow-hidden">
                            <div className="w-full h-5 bg-emerald-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{month}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{day}</span>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                    {event.nama}
                                </p>
                                {event.jenis && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                        {event.jenis}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[150px]">{event.lokasi || "Lokasi TBA"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}