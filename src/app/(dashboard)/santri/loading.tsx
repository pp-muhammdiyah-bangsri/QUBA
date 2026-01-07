import { Skeleton } from "@/components/ui/skeleton";

export default function SantriLoading() {
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
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
            </div>
        </div>
    );
}
