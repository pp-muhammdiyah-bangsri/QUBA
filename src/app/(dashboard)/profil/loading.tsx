import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilLoading() {
    return (
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[150px]" />
                <Skeleton className="h-4 w-[250px]" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
}
