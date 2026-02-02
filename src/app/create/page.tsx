"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import CustomerCard from "@/components/customer-card";
import AppLayout from "@/components/layouts/app-layout";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import CreateCustomerButton from "./_components/create-customer-button";

export default function Page() {
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.customers.getCustomers().then((res) => res.customers),
  });

  return (
    <AppLayout
      title={"Novo Pedido"}
      description="Selecione o cliente para continuar."
      goBack={"/"}
    >
      <div className="grid gap-4">
        {customers.map((customer) => (
          <Link href={`/create/${customer.id}`} key={customer.id}>
            <CustomerCard customer={customer} key={customer.id} />
          </Link>
        ))}
        <Separator />
        <CreateCustomerButton />
      </div>
    </AppLayout>
  );
}
