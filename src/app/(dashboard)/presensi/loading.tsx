import { Skeleton } from "@/components/ui/skeleton";

export default function PresensiLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-4 w-[280px]" />
            </div>
            <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="grid gap-3">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
