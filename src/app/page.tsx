import { PlusIcon } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import ListOrders from "./_components/list-orders";

export default function Page() {
  return (
    <AppLayout
      title={"Tela Inicial"}
      description="Confira seus pedidos."
      footer={
        <div className="flex flex-col gap-1">
          <Button
            className="w-full rounded-full"
            variant={"outline"}
            size={"drawer"}
            asChild
          >
            <Link href={"/create"}>
              <PlusIcon />
              <span>Novo Pedido</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8 py-6">
        <ListOrders />
      </div>
    </AppLayout>
  );
}
