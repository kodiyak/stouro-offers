"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  MinusIcon,
  PlusCircleIcon,
  PlusIcon,
  ShirtIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import z from "zod";
import FormLayout from "@/components/layouts/form-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import {
  useCurrencyFormatter,
  useDisclosure,
  useMutationAPI,
} from "@/lib/hooks";
import { invalidateQueries } from "@/lib/utils";
import CreateProduct from "../create-product";

const schema = z
  .object({
    products: z.record(z.string(), z.number()),
  })
  .refine((data) => {
    return Object.values(data.products).some((quantity) => quantity > 0);
  });
type FormValues = z.infer<typeof schema>;

interface CreateOrderProps {
  customerId: string;
}

export default function CreateOrder({ customerId }: CreateOrderProps) {
  const helpers = [5, 10, 100];
  const createProduct = useDisclosure();

  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { isSubmitting, isValid } = form.formState;

  const { data: customer } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      return api.customers
        .getCustomer({ customerId })
        .then((res) => res.customer);
    },
  });

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

  const [{ total, quantity }, setState] = useState(() => ({
    total: 0,
    quantity: 0,
  }));

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.orders.create({ customerId, ...data });
    },
    onSuccess: async ({ order }) => {
      router.push(`/orders/${order.id}`);
    },
  });

  useEffect(() => {
    form.reset({ products: {} });

    return () => {
      invalidateQueries(["customers", customerId, "products"]);
    };
  }, []);

  useEffect(() => {
    const off = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        const total = products.reduce((acc, product) => {
          const quantity = values.products[product.id] ?? 0;
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

    return () => off();
  }, [form, products]);

  return (
    <>
      <CreateProduct customerId={customerId} {...createProduct} />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((v) => onSubmit.mutateAsync(v))}>
          <FormLayout
            title={customer?.name ?? "..."}
            description={"Criar novo pedido"}
            goBack="/create"
            isOverlayed={createProduct.isOpen}
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
                <Button
                  size={"lg"}
                  type={"submit"}
                  className="rounded-full px-4"
                  disabled={!isValid || isSubmitting}
                >
                  <span className="font-bold">Salvar</span>
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
                        <ShirtIcon className="size-6 mr-2 self-start relative top-1" />
                        <div className="flex flex-col flex-1">
                          <span className="text-xl font-bold">
                            {product.name}
                          </span>
                          <span className="text-sm font-bold text-muted-foreground">
                            {formatCurrency(product.price)} /un
                          </span>
                        </div>
                        <span className="font-mono">
                          {formatCurrency(product.price * field.value)}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-center">
                        <span className="text-5xl font-black">
                          {field.value}
                        </span>
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
                              field.onChange(
                                Math.max(0, field.value - decrement),
                              );
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
              <Separator />
              <button
                type={"button"}
                className="p-2 rounded-xl text-muted-foreground border-2 bg-card border-dashed aspect-video flex flex-col items-center justify-center gap-4"
                onClick={createProduct.onOpen}
              >
                <PlusCircleIcon className="size-12" />
                <span className="text-lg font-bold">
                  Adicionar novo produto
                </span>
              </button>
            </div>
          </FormLayout>
        </form>
      </FormProvider>
    </>
  );
}
