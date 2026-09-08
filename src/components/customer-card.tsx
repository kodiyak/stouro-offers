import Image from "next/image";
import type { Api } from "@/lib/clients/api/types";
import { getAvatarUrl } from "@/lib/utils/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";

interface CustomerCardProps {
  customer: Api.Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Item variant="outline" className="rounded-xl p-2 gap-2.5 bg-card">
      <ItemMedia>
        <Image
          src={getAvatarUrl(customer.name)}
          alt={customer.name}
          width={64}
          height={64}
          className="rounded-xl size-10"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-bold">{customer.name}</ItemTitle>
        <ItemDescription>
          <span>
            {[
              customer._count.products,
              customer._count.products === 1 ? "peça" : "peças",
            ].join(" ")}
          </span>
          <span>{" - "}</span>
          <span>
            {[
              customer._count.orders,
              customer._count.orders === 1 ? "pedido" : "pedidos",
            ].join(" ")}
          </span>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
