"use client";

import { DollarSignIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavigationTab() {
  const pathname = usePathname();

  return (
    <div className="flex h-18 border-t px-6">
      {[
        {
          label: "Pedidos",
          href: "/",
          icon: <HomeIcon />,
        },
        {
          label: "Financeiro",
          href: "/financial",
          icon: <DollarSignIcon />,
        },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn("flex-1 flex flex-col py-1")}
        >
          <div
            className={cn(
              "flex flex-col size-full gap-1 items-center p-1 rounded-xl justify-center",
              item.href === pathname ? "bg-muted" : "",
            )}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
