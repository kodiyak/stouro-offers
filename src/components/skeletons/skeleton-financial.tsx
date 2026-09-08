import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

export default function SkeletonFinancial() {
  return (
    <div className="size-full absolute inset-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="flex flex-col gap-2 p-8">
          <Skeleton className="w-48 h-4" />
          <Skeleton className="w-54 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start gap-2 px-8 py-4">
              <Skeleton className="size-4" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-42 h-4" />
              </div>
            </div>
          ))}
        </div>
        <div className="px-8">
          <Separator className="my-6" />
        </div>
        <div className="flex flex-col px-8">
          <Skeleton className="h-16" />
        </div>
        <div className="px-8">
          <Separator className="my-6" />
        </div>
        <div className="flex flex-col px-8 gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    </div>
  );
}
