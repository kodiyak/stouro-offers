import { Skeleton } from "../ui/skeleton";

const CARDS = ["a", "b"];
const BUTTONS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function SkeletonCreateOrder() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-16 items-center gap-4 border-b px-6">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="w-8" />
      </header>
      <main className="flex flex-1 flex-col gap-6 overflow-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-full" />
          <Skeleton className="h-10 rounded-full" />
        </div>
        {CARDS.map((card) => (
          <div key={card} className="flex flex-col gap-6 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mx-auto h-10 w-20" />
            <div className="grid grid-cols-4 gap-2">
              {BUTTONS.map((button) => (
                <Skeleton key={button} className="h-9 rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </main>
      <footer className="flex items-center gap-2 border-t px-4 py-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-14" />
          <div className="flex items-end gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="size-11 rounded-full" />
      </footer>
    </div>
  );
}
