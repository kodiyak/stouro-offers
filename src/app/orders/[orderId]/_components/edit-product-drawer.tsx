"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useOverlayedActive } from "@/components/providers/overlayed-provider";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/clients/api";
import type { Api } from "@/lib/clients/api/types";
import { type UseDisclosure, useMutationAPI } from "@/lib/hooks";
import { invalidateQueries } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  price: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "number" ? val : Number(val.split(",").join(".")),
    )
    .refine((val) => val >= 0, {
      message: "Preço deve ser um número não negativo",
    }),
});

type FormValues = z.infer<typeof schema>;

interface EditProductDrawerProps extends UseDisclosure {
  customerId: string;
  productId: string;
  orderId: string;
  itemId: string;
}

export default function EditProductDrawer({
  isOpen,
  onOpenChange,
  onClose,
  customerId,
  productId,
  orderId,
  itemId,
}: EditProductDrawerProps) {
  useOverlayedActive(isOpen);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });
  const { isSubmitting, isDirty, isValid } = form.formState;

  const { data: products = [] } = useQuery({
    queryKey: ["customers", customerId, "products"],
    queryFn: async () => {
      return api.customers
        .getProducts({ customerId })
        .then((res) => res.products);
    },
  });

  const product = products.find((product) => product.id === productId) as
    | Api.Product
    | undefined;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.customers.updateProduct({
        productId,
        orderId,
        itemId,
        name: data.name,
        price: Math.round(data.price * 100),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        invalidateQueries(["orders", orderId]),
        invalidateQueries(["customers", customerId, "products"]),
      ]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Salvando produto...",
        description: "Estamos atualizando o produto.",
      }),
      success: () => ({
        title: "Produto atualizado!",
        description: "O produto e o item do pedido foram atualizados.",
      }),
      error: () => ({
        title: "Erro ao atualizar produto",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen && product) {
      form.reset({
        name: product.name,
        price: product.price / 100,
      });
    }
  }, [isOpen, product, form]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Editar Produto</DrawerTitle>
          <DrawerDescription>
            Atualize o nome e o preço do produto. O item deste pedido será
            atualizado junto.
          </DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit((v) => onSubmit.mutateAsync(v as never))}
        >
          <FieldSet className="w-full px-4">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder={"Camisa Polo, Canarinho, etc..."}
                      autoComplete="off"
                    />
                    <FieldDescription>Título do produto</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Preço</FieldLabel>
                    <CurrencyInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <DrawerFooter>
            <Button
              size={"drawer"}
              type={"submit"}
              disabled={isSubmitting || !product || !isDirty || !isValid}
            >
              <CheckIcon />
              <span>Salvar</span>
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
