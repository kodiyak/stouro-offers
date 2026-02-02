import Image from "next/image";
import type { Api } from "@/lib/clients/api/types";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
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
          src={`https://avatar.vercel.sh/${customer.name}`}
          alt={customer.name}
          width={64}
          height={64}
          className="rounded-xl size-10"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-bold">{customer.name}</ItemTitle>
        <ItemDescription>{"5 pedidos"}</ItemDescription>
      </ItemContent>
    </Item>
  );
}
