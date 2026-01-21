"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
    id: string;
    nama: string;
    jenjang: string;
    total_points: number;
    level: number;
    badge_count: number;
}

interface LeaderboardCardProps {
    entries: LeaderboardEntry[];
    title?: string;
    currentSantriId?: string;
}

const rankIcons = [
    <Trophy key="1" className="w-5 h-5 text-yellow-500" />,
    <Medal key="2" className="w-5 h-5 text-gray-400" />,
    <Award key="3" className="w-5 h-5 text-amber-600" />,
];

const levelNames: Record<number, string> = {
    1: "Mubtadi'",
    2: "Mutawassith",
    3: "Mutaqaddim",
    4: "Hafidz Muda",
    5: "Hafidz",
};

export function LeaderboardCard({
    entries,
    title = "Leaderboard",
    currentSantriId,
}: LeaderboardCardProps) {
    return (
        <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-border/50 pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {entries.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Belum ada data leaderboard
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {entries.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${currentSantriId === entry.id
                                        ? "bg-amber-50/50 dark:bg-amber-900/10"
                                        : ""
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-8 h-8 flex items-center justify-center">
                                    {index < 3 ? (
                                        rankIcons[index]
                                    ) : (
                                        <span className="text-lg font-bold text-muted-foreground">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${index === 0
                                            ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                            : index === 1
                                                ? "bg-gradient-to-br from-gray-300 to-gray-400"
                                                : index === 2
                                                    ? "bg-gradient-to-br from-amber-500 to-orange-600"
                                                    : "bg-gradient-to-br from-blue-400 to-blue-500"
                                        }`}
                                >
                                    {entry.nama.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground truncate">
                                            {entry.nama}
                                        </span>
                                        {currentSantriId === entry.id && (
                                            <Badge variant="secondary" className="text-xs">
                                                Anda
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{entry.jenjang}</span>
                                        <span>•</span>
                                        <span>Lvl {entry.level} ({levelNames[entry.level] || ""})</span>
                                        <span>•</span>
                                        <span>{entry.badge_count} 🎖️</span>
                                    </div>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {entry.total_points.toLocaleString("id-ID")}
                                    </span>
                                    <p className="text-xs text-muted-foreground">poin</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
