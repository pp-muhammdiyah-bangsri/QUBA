import { Skeleton } from "@/components/ui/skeleton";

export default function KesantrianLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[280px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[100px] rounded-xl" />
                <Skeleton className="h-[100px] rounded-xl" />
                <Skeleton className="h-[100px] rounded-xl" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
    );
}
