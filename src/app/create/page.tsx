"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import CustomerCard from "@/components/customer-card";
import CreateCustomer from "@/components/forms/create-customer";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/clients/api";
import { useDisclosure } from "@/lib/hooks";

export default function Page() {
  const create = useDisclosure();
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.customers.getCustomers().then((res) => res.customers),
  });

  return (
    <>
      <CreateCustomer {...create} />
      <AppLayout
        title={"Novo Pedido"}
        description="Selecione o cliente para continuar."
        goBack={"/"}
        footer={
          <Button size={"drawer"} variant={"outline"} onClick={create.onOpen}>
            <PlusIcon />
            <span>Novo Cliente</span>
          </Button>
        }
      >
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Link href={`/create/${customer.id}`} key={customer.id}>
              <CustomerCard customer={customer} key={customer.id} />
            </Link>
          ))}
        </div>
      </AppLayout>
    </>
  );
}
