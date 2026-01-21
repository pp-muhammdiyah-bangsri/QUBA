"use client";

import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface LevelProgressProps {
    level: number;
    levelName: string;
    totalPoints: number;
    progress: number;
    nextLevelPoints: number | null;
}

export function LevelProgress({
    level,
    levelName,
    totalPoints,
    progress,
    nextLevelPoints,
}: LevelProgressProps) {
    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            Level {level}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                            {levelName}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {totalPoints.toLocaleString("id-ID")} poin total
                    </p>
                </div>
            </div>

            {nextLevelPoints && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress ke Level {level + 1}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-amber-100 dark:bg-amber-900/50"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {nextLevelPoints.toLocaleString("id-ID")} poin untuk level selanjutnya
                    </p>
                </div>
            )}

            {!nextLevelPoints && (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center mt-2">
                    🎉 Level Maksimum Tercapai!
                </p>
            )}
        </div>
    );
}
