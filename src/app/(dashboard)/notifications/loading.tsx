import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[180px]" />
                <Skeleton className="h-4 w-[280px]" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
            </div>
        </div>
    );
}
