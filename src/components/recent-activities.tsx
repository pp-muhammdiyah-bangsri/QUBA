import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertTriangle, Clock } from "lucide-react";

export interface ActivityItem {
    id: string | number;
    type: "hafalan" | "pelanggaran" | "perizinan";
    text: string;
    time: string;
}

const iconMap = {
    hafalan: { icon: BookOpen, color: "text-emerald-500 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" },
    pelanggaran: { icon: AlertTriangle, color: "text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/30" },
    perizinan: { icon: Clock, color: "text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
};

export function RecentActivities({ activities = [] }: { activities?: ActivityItem[] }) {
    if (!activities.length) {
        return <p className="text-gray-500 dark:text-gray-400 text-sm italic py-4 text-center">Belum ada aktivitas terbaru.</p>;
    }

    return (
        <div className="relative pl-4 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-6 top-1 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800" />

            {activities.map((activity) => {
                const mapItem = iconMap[activity.type as keyof typeof iconMap] || iconMap.hafalan;
                const Icon = mapItem.icon;
                const color = mapItem.color;

                return (
                    <div key={activity.id} className="relative flex items-start gap-4">
                        <div className={`relative z-10 flex-shrink-0 p-2.5 rounded-full ring-4 ring-white dark:ring-card ${color} shadow-sm`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-relaxed">
                                {activity.text}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                                {activity.time}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}