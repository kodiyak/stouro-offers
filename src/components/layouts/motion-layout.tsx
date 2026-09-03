"use client";

import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { standardTransition } from "@/lib/shared";
import { useOverlayed } from "../providers/overlayed-provider";

export function MotionLayout({ children }: PropsWithChildren) {
  const { isOverlayed } = useOverlayed();
  return (
    <motion.div
      className="h-dvh flex flex-col overflow-hidden"
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
