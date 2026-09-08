import { Skeleton } from "../ui/skeleton";

export default function SkeletonOrders() {
  return (
    <div className="size-full absolute inset-0 overflow-hidden">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        {[0, 1].map((group) => (
          <div key={group} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
