import type { Api } from "@/lib/clients/api/types";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "./ui/item";

interface CustomerCardProps {
  customer: Api.Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Item variant="outline" className="p-2 gap-2">
      <ItemHeader>
        <div className="aspect-video rounded-lg relative">
          <div
            className="absolute inset-0 z-30 size-full opacity-50 mix-blend-color"
            style={{ backgroundColor: customer.color }}
          />
          <img
            src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Photo by mymind on Unsplash"
            title="Photo by mymind on Unsplash"
            className="relative z-20 size-full rounded-lg object-cover brightness-60 grayscale"
          />
        </div>
      </ItemHeader>
      <ItemContent>
        <ItemTitle className="font-semibold">{customer.name}</ItemTitle>
        {/* <ItemDescription>{customer.createdAt}</ItemDescription> */}
      </ItemContent>
    </Item>
  );
}
