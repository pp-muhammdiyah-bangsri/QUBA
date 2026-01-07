import { Skeleton } from "@/components/ui/skeleton";

export default function DataMasterLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[180px]" />
                    <Skeleton className="h-4 w-[280px]" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
            </div>
        </div>
    );
}
