"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, MinusIcon, PlusIcon, ShirtIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import z from "zod";
import FormLayout from "@/components/layouts/form-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { api } from "@/lib/clients/api";
import { useCurrencyFormatter } from "@/lib/hooks";

const schema = z.object({
  products: z.record(z.string(), z.number()),
});
type FormValues = z.infer<typeof schema>;

interface CreateOrderProps {
  customerId: string;
}

export default function CreateOrder({ customerId }: CreateOrderProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const formProducts = form.watch("products");
  const helpers = [5, 10, 100];
  const { formatCurrency } = useCurrencyFormatter();

  const { data: products = [] } = useQuery({
    queryKey: ["customers", customerId, "products"],
    queryFn: async () => {
      const products = await api.customers
        .getProducts({ customerId })
        .then((res) => res.products);

      products.forEach((product) => {
        if (form.getValues(`products.${product.id}`) === undefined) {
          form.setValue(`products.${product.id}`, 0);
        }
      });

      return products;
    },
  });

  const [{ total, quantity }, setState] = useState({ total: 0, quantity: 0 });

  useEffect(() => {
    return form.subscribe({
      callback: ({ values }) => {
        const total = products.reduce((acc, product) => {
          const quantity = values.products[product.id] ?? 0;
          console.log({ productId: product.id, quantity });
          return acc + product.price * quantity;
        }, 0);

        const quantity = Object.values(values.products).reduce(
          (acc, quantity) => {
            return acc + quantity;
          },
          0,
        );

        setState(() => ({ total, quantity }));
      },
    });
  }, [products]);

  return (
    <FormProvider {...form}>
      <FormLayout
        title={"Confecção Estrela"}
        description={"Criar novo pedido"}
        goBack="/create"
        footer={
          <div className="border-t py-2 px-4 flex items-center">
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <div className="flex gap-2 items-end">
                <span className="text-xl font-black leading-none font-mono">
                  {formatCurrency(total)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({quantity} peças)
                </span>
              </div>
            </div>
            <Button size={"lg"} className="rounded-full px-4">
              <span className="font-bold">Revisar</span>
              <ArrowRightIcon />
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-6">
          {products.map((product) => (
            <Controller
              key={product.id}
              name={`products.${product.id}`}
              render={({ field }) => (
                <Card className="py-4">
                  <div className="flex items-center gap-2 px-4">
                    <ShirtIcon className="size-6" />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold">{product.name}</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(product.price)} /un
                      </span>
                    </div>
                    <span className="font-mono">
                      {formatCurrency(product.price * field.value)}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <span className="text-5xl font-black">{field.value}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 px-4">
                    {[
                      {
                        icon: <PlusIcon />,
                        onClick: () => {
                          field.onChange(field.value + 1);
                        },
                      },
                      ...helpers.map((increment) => ({
                        icon: (
                          <>
                            <PlusIcon />
                            <span className="text-lg font-bold">
                              {increment}
                            </span>
                          </>
                        ),
                        onClick: () => {
                          field.onChange(field.value + increment);
                        },
                      })),
                      {
                        icon: <MinusIcon />,
                        onClick: () => {
                          field.onChange(Math.max(0, field.value - 1));
                        },
                        disabled: field.value < 1,
                      },
                      ...helpers.map((decrement) => ({
                        icon: (
                          <>
                            <MinusIcon />
                            <span className="text-lg font-bold">
                              {decrement}
                            </span>
                          </>
                        ),
                        onClick: () => {
                          field.onChange(Math.max(0, field.value - decrement));
                        },
                        disabled: field.value < decrement,
                      })),
                    ].map(({ icon, onClick, ...rest }, index) => (
                      <Button
                        key={index}
                        variant={"outline"}
                        onClick={onClick}
                        {...rest}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            />
          ))}
        </div>
      </FormLayout>
    </FormProvider>
  );
}
