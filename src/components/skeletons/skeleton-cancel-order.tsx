import { Skeleton } from "../ui/skeleton";

export default function SkeletonCancelOrder() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-full" />
        <Skeleton className="h-10 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
