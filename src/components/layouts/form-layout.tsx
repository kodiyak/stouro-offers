import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "../ui/button";
import { MotionLayout } from "./motion-layout";

interface FormLayoutProps {
  title: string;
  description?: string;
  goBack?: string;
  footer?: ReactNode;
}

export default function FormLayout({
  title,
  children,
  description,
  goBack,
  footer,
}: PropsWithChildren<FormLayoutProps>) {
  return (
    <MotionLayout>
      <header className="h-16 border-b flex items-center gap-4">
        <div className="container h-full flex items-center mx-auto px-6">
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
          <div className="flex flex-col gap-0.5 items-center flex-1">
            <h1 className="text-sm font-bold">{title}</h1>
            {description && (
              <h2 className="text-xs text-muted-foreground">{description}</h2>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-6 py-2">{children}</main>
      {footer}
    </MotionLayout>
  );
}
