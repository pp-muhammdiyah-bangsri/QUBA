import { Skeleton } from "@/components/ui/skeleton";

export default function LaporanLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[180px]" />
                <Skeleton className="h-4 w-[320px]" />
            </div>
            <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
    );
}
