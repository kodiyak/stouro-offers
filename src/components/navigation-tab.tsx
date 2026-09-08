"use client";

import { DollarSignIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  {
    label: "Pedidos",
    href: "/",
    icon: <HomeIcon />,
    match: ["/", "/orders", "/create"],
  },
  {
    label: "Financeiro",
    href: "/financial",
    icon: <DollarSignIcon />,
    match: ["/financial"],
  },
] as const;

function isActive(pathname: string, match: readonly string[]) {
  return match.some(
    (prefix) =>
      pathname === prefix ||
      (prefix !== "/" && pathname.startsWith(`${prefix}/`)),
  );
}

export default function NavigationTab() {
  const pathname = usePathname();

  return (
    <div className="flex h-18 border-t px-6">
      {TABS.map((item) => {
        const active = isActive(pathname, item.match);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("flex-1 flex flex-col py-1")}
          >
            <div
              className={cn(
                "flex flex-col size-full gap-1 items-center p-1 rounded-xl justify-center",
                active && "bg-muted",
              )}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
