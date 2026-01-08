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
        return <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada aktivitas terbaru.</p>;
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                const mapItem = iconMap[activity.type as keyof typeof iconMap] || iconMap.hafalan;
                const Icon = mapItem.icon;
                const color = mapItem.color;

                return (
                    <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-100">{activity.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}