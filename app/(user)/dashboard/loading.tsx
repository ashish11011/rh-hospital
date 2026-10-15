import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center">
      <Skeleton className="bg-primary/10 h-48 w-full animate-pulse border md:w-80" />
    </div>
  );
}
