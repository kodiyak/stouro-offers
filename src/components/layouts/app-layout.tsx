"use client";

import { ArrowLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import { standardTransition } from "@/lib/shared";
import { Button } from "../ui/button";

interface AppLayoutProps {
  title: string;
  description?: string;
  goBack?: string;
  isOverlayed?: boolean;
  footer?: ReactNode;
}

export default function AppLayout({
  title,
  children,
  footer,
  description,
  goBack,
  isOverlayed,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <motion.div
      className="h-dvh w-dvw flex flex-col overflow-hidden"
      animate={{
        scale: isOverlayed ? 0.9 : 1,
        opacity: isOverlayed ? 0.5 : 1,
      }}
      transition={{ ...standardTransition, duration: isOverlayed ? 0.6 : 0.24 }}
    >
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
      {footer && <footer className="px-6 py-2 border-t">{footer}</footer>}
    </motion.div>
  );
}
