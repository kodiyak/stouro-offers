import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { Button } from "../ui/button";

interface AppLayoutProps {
  title: string;
  description?: string;
  goBack?: string;
}

export default function AppLayout({
  title,
  children,
  description,
  goBack,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="py-8 flex items-center gap-4 px-6">
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
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <h2 className="text-lg text-muted-foreground">{description}</h2>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-6">{children}</main>
    </div>
  );
}
