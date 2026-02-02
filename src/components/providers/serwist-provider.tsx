"use client";

import { SerwistProvider as BaseSerwistProvider } from "@serwist/turbopack/react";
import { useEffect, useState } from "react";

export function SerwistProvider({
  children,
  swUrl,
}: {
  children: React.ReactNode;
  swUrl: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <BaseSerwistProvider swUrl={swUrl}>{children}</BaseSerwistProvider>;
}
