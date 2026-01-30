import { InfoIcon } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

function Description({
  className,
  title,
  titleClassName,
  description,
  descriptionClassName,
  tooltip,
  icon,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  titleClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  icon?: ReactNode;
  tooltip?: string;
}) {
  return (
    <div className={cn("flex flex-col text-sm gap-1", className)} {...props}>
      {(title || tooltip) && (
        <div className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-muted-foreground">
          {icon}
          {title && (
            <span
              className={cn(
                "text-muted-foreground tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </span>
          )}
          {tooltip && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="size-4 rounded-full bg-muted p-0.5 ml-2">
                    <InfoIcon className="size-3 text-muted-foreground/40" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className={cn(descriptionClassName)}>{description}</div>
    </div>
  );
}

function DescriptionRow({
  className,
  title,
  titleClassName,
  description,
  descriptionClassName,
  tooltip,
  icon,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  titleClassName?: string;
  icon?: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-sm gap-1",
        className,
      )}
      {...props}
    >
      {(title || tooltip) && (
        <div className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-muted-foreground">
          {icon}
          {title && (
            <span
              className={cn(
                "text-muted-foreground tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </span>
          )}
          {tooltip && (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="size-4 rounded-full bg-muted p-0.5 ml-2">
                    <InfoIcon className="size-3 text-muted-foreground/40" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {typeof description === "string" ? (
        <div
          className={cn(
            "font-semibold text-secondary-foreground",
            descriptionClassName,
          )}
        >
          {description}
        </div>
      ) : (
        description
      )}
    </div>
  );
}

export { Description, DescriptionRow };
