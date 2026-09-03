import { CornerDownRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCurrencyFormatter } from "@/lib/hooks/use-currency-formatter";
import TileMoney from "../app/financial/activity/_components/tile-money";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./ui/item";

interface ActivityMoneyHeaderProps {
  title: string;
  value?: number;
  items: {
    label: string;
    icon: ReactNode;
    value: number;
  }[];
}
export default function ActivityMoneyHeader({
  items,
  title,
  value,
}: ActivityMoneyHeaderProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="flex flex-col">
      <TileMoney title={title} value={value} />
      <div className="flex flex-col">
        {items.map((item, index) => (
          <Item key={`${item.label}.${index}`}>
            <ItemMedia>{item.icon}</ItemMedia>
            <ItemContent>
              <ItemTitle>{item.label}</ItemTitle>
              <ItemDescription>{formatCurrency(item.value)}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  );
}
