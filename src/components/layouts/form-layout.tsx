import { ArrowLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { standardTransition } from "@/lib/shared";
import { Button } from "../ui/button";

interface FormLayoutProps {
  title: string;
  description?: string;
  goBack?: string;
  footer?: ReactNode;
  isOverlayed?: boolean;
}

export default function FormLayout({
  title,
  children,
  description,
  goBack,
  footer,
  isOverlayed,
}: PropsWithChildren<FormLayoutProps>) {
  return (
    <motion.div
      className="h-dvh w-dvw overflow-hidden flex flex-col"
      animate={{
        scale: isOverlayed ? 0.9 : 1,
        opacity: isOverlayed ? 0.5 : 1,
      }}
      transition={{ ...standardTransition, duration: isOverlayed ? 0.6 : 0.24 }}
    >
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
      <main className="flex-1 overflow-auto px-6">{children}</main>
      {footer}
    </motion.div>
  );
}
