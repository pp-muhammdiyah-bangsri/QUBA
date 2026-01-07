import { Skeleton } from "@/components/ui/skeleton";

export default function AsatidzLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-4 w-[250px]" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        </div>
    );
}
