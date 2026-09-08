import { ListTreeIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyScreenProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyScreen({
  title,
  description,
  icon,
}: EmptyScreenProps) {
  return (
    <div className="relative border border-dashed flex flex-col rounded-2xl dark:bg-muted/20">
      <div className="flex-1 flex flex-col items-center justify-center pt-6">
        <div className="size-24 rounded-full border flex items-center justify-center bg-background">
          {icon ?? <ListTreeIcon className="size-8 text-muted-foreground" />}
        </div>
        {title && (
          <span className="text-xl font-mono font-bold my-3">{title}</span>
        )}
      </div>
      <div className="border-t border-dashed px-12 py-2 dark:bg-muted/30 rounded-b-2xl">
        <p className="text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
