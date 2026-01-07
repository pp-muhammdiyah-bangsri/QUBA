import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[350px]" />
            </div>

            {/* Stats/Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
                <Skeleton className="h-[120px] rounded-xl" />
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                <Skeleton className="col-span-3 h-[400px] rounded-xl" />
            </div>

            <div className="space-y-4">
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
            </div>
        </div>
    );
}
