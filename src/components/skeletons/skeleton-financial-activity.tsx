import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const BALANCES = ["a", "b", "c"];
const LINES = ["a", "b", "c"];

export default function SkeletonFinancialActivity() {
  return (
    <div className="size-full absolute inset-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-56" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-6" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-6" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-col overflow-hidden rounded-xl border">
            {BALANCES.map((balance) => (
              <div
                key={balance}
                className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-0"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        <Separator className="my-2" />
        <div className="flex flex-col px-4 py-2">
          <Skeleton className="h-3 w-24" />
        </div>
        {LINES.map((line) => (
          <div key={line} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
