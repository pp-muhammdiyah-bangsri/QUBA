import { Skeleton } from "@/components/ui/skeleton";

export default function EventLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[180px]" />
                    <Skeleton className="h-4 w-[250px]" />
                </div>
                <Skeleton className="h-10 w-[130px]" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
    );
}
