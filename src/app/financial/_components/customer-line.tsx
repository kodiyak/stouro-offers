"use client";

import { BanknoteIcon, CornerUpLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter } from "@/lib/hooks/use-currency-formatter";
import { cn } from "@/lib/utils";

interface CustomerLineProps {
  customer: Api.FinancialCustomerBalance;
}

export default function CustomerLine({ customer }: CustomerLineProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { balance } = customer;
  const credit = balance < 0;
  const receivable = balance > 0;

  return (
    <Item variant={"outline"}>
      <ItemMedia>
        <Image
          src={`https://avatar.vercel.sh/${customer.name}`}
          alt={customer.name}
          width={64}
          height={64}
          className="rounded-xl size-10"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-bold">{customer.name}</ItemTitle>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {credit ? (
            <CornerUpLeftIcon className="size-3.5" />
          ) : (
            <BanknoteIcon className="size-3.5" />
          )}
          <span
            className={cn(
              "font-mono font-semibold",
              credit
                ? "text-emerald-500"
                : receivable
                  ? "text-amber-500"
                  : undefined,
            )}
          >
            {formatCurrency(Math.abs(balance))}
          </span>
          <span>
            {credit ? "crédito" : receivable ? "a receber" : "em dia"}
          </span>
        </div>
      </ItemContent>
      <ItemActions>
        <Button variant={"outline"} size={"xs"} asChild>
          <Link href={`/financial/pay/${customer.id}`}>
            <span>Pagar</span>
          </Link>
        </Button>
      </ItemActions>
    </Item>
  );
}
