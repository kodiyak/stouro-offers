"use client";

import { ArrowLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { useOverlayed } from "@/components/providers/overlayed-provider";
import { standardTransition } from "@/lib/shared";
import { Button } from "../ui/button";

interface AppLayoutProps {
  title: string;
  description?: ReactNode;
  goBack?: string;
  footer?: ReactNode;
}

export default function AppLayout({
  title,
  children,
  footer,
  description,
  goBack,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <AppMotionWrapper>
      <header className="py-2 border-b flex items-center gap-4 px-6">
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
            <h1 className="text-xl font-bold">{title}</h1>
            {description && typeof description === "string" && (
              <h2 className="text-base text-muted-foreground">{description}</h2>
            )}
            {description && typeof description !== "string" && description}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-6 py-2">{children}</main>
      {footer && <footer className="px-6 py-2 border-t">{footer}</footer>}
    </AppMotionWrapper>
  );
}

function AppMotionWrapper({ children }: PropsWithChildren) {
  const { isOverlayed } = useOverlayed();
  return (
    <motion.div
      className="h-dvh w-dvw flex flex-col overflow-hidden"
      animate={{
        scale: isOverlayed ? 0.95 : 1,
        opacity: isOverlayed ? 0.5 : 1,
      }}
      transition={{
        ...standardTransition,
        duration: isOverlayed ? 0.4 : 0.24,
      }}
    >
      {children}
    </motion.div>
  );
}
