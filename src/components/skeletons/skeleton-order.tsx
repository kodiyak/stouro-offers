import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const ITEMS = ["a", "b", "c", "d", "e"];
const MANIFESTS = ["a", "b"];

export default function SkeletonOrder() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-16 items-center gap-4 border-b px-6 py-2">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="ml-auto h-5 w-20 rounded-full" />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto px-6 py-4">
        {ITEMS.map((item) => (
          <div key={item} className="rounded-lg border p-2">
            <div className="flex items-center gap-4 px-4 py-2">
              <Skeleton className="size-6 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        {MANIFESTS.map((manifest) => (
          <div
            key={manifest}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Skeleton className="size-6 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
        <Separator className="my-4" />
        <div className="flex flex-col gap-2 px-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </main>
      <footer className="flex flex-col items-end gap-2 border-t px-6 py-3">
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
