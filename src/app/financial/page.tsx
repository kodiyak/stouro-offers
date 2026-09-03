import { CornerUpLeftIcon, ListIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ActivityMoneyHeader from "@/components/activity-money-header";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import CustomerLine from "./_components/customer-line";

export default function Page() {
  return (
    <AppLayout
      title={"Financeiro"}
      description="Confira sua saude financeira."
      className="p-6"
      footer={
        <div className="flex flex-col gap-1">
          <Button variant={"outline"} size={"drawer"} asChild>
            <Link href={"/financial/activity"}>
              <PlusIcon />
              <span>Registrar Pagamento</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <ActivityMoneyHeader
          title={"Balanço"}
          value={3000_00}
          items={[
            {
              label: "Receitas",
              icon: <CornerUpLeftIcon className="size-5" />,
              value: 3000_00,
            },
          ]}
        />
        <Separator />
        <div className="flex flex-col">
          <Link href={"/financial/activity"}>
            <Item variant={"outline"}>
              <ItemMedia>
                <ListIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Extrato</ItemTitle>
                <ItemDescription>
                  Veja o extrato completo no período selecionado.
                </ItemDescription>
              </ItemContent>
            </Item>
          </Link>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <CustomerLine />
          <CustomerLine />
          <CustomerLine />
          <CustomerLine />
        </div>
      </div>
    </AppLayout>
  );
}
