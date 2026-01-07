"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: number | string;
    previousValue?: number;
    icon: LucideIcon;
    color: "emerald" | "blue" | "purple" | "orange" | "red";
    suffix?: string;
    showTrend?: boolean;
}

const colorClasses = {
    emerald: {
        bg: "from-emerald-500 to-emerald-600",
        icon: "bg-emerald-400/20",
        trend: "text-emerald-100",
    },
    blue: {
        bg: "from-blue-500 to-blue-600",
        icon: "bg-blue-400/20",
        trend: "text-blue-100",
    },
    purple: {
        bg: "from-purple-500 to-purple-600",
        icon: "bg-purple-400/20",
        trend: "text-purple-100",
    },
    orange: {
        bg: "from-orange-500 to-orange-600",
        icon: "bg-orange-400/20",
        trend: "text-orange-100",
    },
    red: {
        bg: "from-red-500 to-red-600",
        icon: "bg-red-400/20",
        trend: "text-red-100",
    },
};

export function KPICard({
    title,
    value,
    previousValue,
    icon: Icon,
    color,
    suffix = "",
    showTrend = true,
}: KPICardProps) {
    const colorClass = colorClasses[color];

    // Calculate trend
    let trendPercent = 0;
    let trendDirection: "up" | "down" | "neutral" = "neutral";

    if (showTrend && previousValue !== undefined && typeof value === "number") {
        if (previousValue === 0) {
            trendPercent = value > 0 ? 100 : 0;
        } else {
            trendPercent = Math.round(((value - previousValue) / previousValue) * 100);
        }

        if (trendPercent > 0) trendDirection = "up";
        else if (trendPercent < 0) trendDirection = "down";
    }

    return (
        <Card className={cn(
            "border-0 shadow-lg overflow-hidden",
            "bg-gradient-to-br",
            colorClass.bg
        )}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">
                                {typeof value === "number" ? value.toLocaleString() : value}
                            </span>
                            {suffix && (
                                <span className="text-white/70 text-sm">{suffix}</span>
                            )}
                        </div>

                        {showTrend && previousValue !== undefined && (
                            <div className={cn("flex items-center gap-1 mt-2", colorClass.trend)}>
                                {trendDirection === "up" && <TrendingUp className="w-4 h-4" />}
                                {trendDirection === "down" && <TrendingDown className="w-4 h-4" />}
                                {trendDirection === "neutral" && <Minus className="w-4 h-4" />}
                                <span className="text-sm">
                                    {trendDirection === "up" && "+"}
                                    {trendPercent}% dari bulan lalu
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={cn("p-3 rounded-xl", colorClass.icon)}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
