import { Skeleton } from "../ui/skeleton";

const ROWS = ["a", "b", "c", "d", "e", "f"];

export default function SkeletonCustomers() {
  return (
    <div className="size-full absolute inset-0 overflow-hidden">
      <div className="flex flex-col gap-3 p-6">
        {ROWS.map((row) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-xl border bg-card p-2"
          >
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
