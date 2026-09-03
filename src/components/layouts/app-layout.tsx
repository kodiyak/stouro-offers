import {
  ArrowLeftIcon,
  DollarSignIcon,
  HomeIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import NavigationTab from "../navigation-tab";
import { Button } from "../ui/button";
import { MotionLayout } from "./motion-layout";

interface AppLayoutProps {
  title: string;
  description?: ReactNode;
  goBack?: string;
  footer?: ReactNode;
  className?: string;
}

export default function AppLayout({
  title,
  children,
  footer,
  description,
  goBack,
  className,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <MotionLayout>
      <header className="h-16 py-2 border-b flex items-center gap-4 px-6">
        {goBack && (
          <Button
            size={"icon-sm"}
            variant={"ghost"}
            className="rounded-full"
            asChild
          >
            <Link href={goBack}>
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
        )}
        <div className="container h-full flex items-center mx-auto">
          <div className="flex flex-col flex-1">
            <h1 className="text-sm font-medium">{title}</h1>
            {description && typeof description === "string" && (
              <h2 className="text-xs text-muted-foreground">{description}</h2>
            )}
            {description && typeof description !== "string" && description}
          </div>
        </div>
      </header>
      <main className={cn("flex-1 overflow-auto px-6 py-2", className)}>
        {children}
      </main>
      {footer && <footer className="px-6 py-2 border-t">{footer}</footer>}
      <NavigationTab />
    </MotionLayout>
  );
}
