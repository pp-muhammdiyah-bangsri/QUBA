"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
    icon: string;
    nama: string;
    deskripsi?: string | null;
    poin: number;
    kategori: string;
    earnedAt?: string | null;
    isLocked?: boolean;
    size?: "sm" | "md" | "lg";
}

const kategoriColors: Record<string, string> = {
    hafalan: "from-emerald-500 to-teal-600",
    presensi: "from-blue-500 to-indigo-600",
    adab: "from-purple-500 to-pink-600",
    khusus: "from-amber-500 to-orange-600",
};

export function BadgeCard({
    icon,
    nama,
    deskripsi,
    poin,
    kategori,
    earnedAt,
    isLocked = false,
    size = "md",
}: BadgeCardProps) {
    const sizeClasses = {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    const iconSizes = {
        sm: "text-2xl",
        md: "text-4xl",
        lg: "text-5xl",
    };

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-0 shadow-md transition-all duration-300",
                isLocked
                    ? "opacity-50 grayscale"
                    : "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            )}
        >
            {/* Gradient background */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-10",
                    kategoriColors[kategori] || kategoriColors.khusus
                )}
            />

            <CardContent className={cn("relative", sizeClasses[size])}>
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                        className={cn(
                            "flex-shrink-0 flex items-center justify-center rounded-xl",
                            isLocked ? "bg-gray-200 dark:bg-gray-700" : `bg-gradient-to-br ${kategoriColors[kategori] || kategoriColors.khusus}`,
                            size === "sm" ? "w-12 h-12" : size === "md" ? "w-14 h-14" : "w-16 h-16"
                        )}
                    >
                        <span className={cn(iconSizes[size], isLocked && "opacity-50")}>
                            {isLocked ? "🔒" : icon}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3
                            className={cn(
                                "font-bold text-foreground truncate",
                                size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
                            )}
                        >
                            {nama}
                        </h3>

                        {deskripsi && size !== "sm" && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {deskripsi}
                            </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                    isLocked
                                        ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                )}
                            >
                                +{poin} poin
                            </span>

                            {earnedAt && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(earnedAt).toLocaleDateString("id-ID")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
