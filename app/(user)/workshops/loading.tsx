import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className=" container py-12">
            <Skeleton className=" mx-auto w-full rounded-full max-w-sm h-4" />
            <div className=" max-w-md w-full mt-12 space-y-4 mx-auto">
                <Skeleton className=" w-full rounded-full h-4" />
                <Skeleton className=" w-full rounded-full h-4" />
            </div>
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
                <Skeleton className=" h-96 rounded-md" />
                <Skeleton className=" h-96 rounded-md" />
                <Skeleton className=" h-96 rounded-md" />
            </div>
        </div>
    )
}