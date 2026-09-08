import { Skeleton } from "../ui/skeleton";

export default function SkeletonRegisterPayment() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-16 items-center gap-4 border-b px-6">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="w-8" />
      </header>
      <main className="flex flex-1 flex-col gap-6 overflow-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((card) => (
            <div
              key={card}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-36" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-10 rounded-full" />
            <Skeleton className="h-10 rounded-full" />
            <Skeleton className="h-10 rounded-full" />
          </div>
        </div>
      </main>
      <footer className="flex items-center gap-2 border-t px-4 py-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="size-11 rounded-full" />
      </footer>
    </div>
  );
}
