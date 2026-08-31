"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, PencilIcon, TrashIcon } from "lucide-react";
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import QuantityStepper from "@/components/ui/quantity-stepper";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import type { Api } from "@/lib/clients/api/types";
import {
  type UseDisclosure,
  useCurrencyFormatter,
  useMutationAPI,
} from "@/lib/hooks";
import { invalidateQueries } from "@/lib/utils";

const schema = z.object({
  quantity: z.number().int().min(1),
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

interface EditOrderItemDrawerProps extends UseDisclosure {
  orderId: string;
  item: Api.OrderItem;
  onEditProduct: () => void;
}

export default function EditOrderItemDrawer({
  isOpen,
  onOpenChange,
  onClose,
  orderId,
  item,
  onEditProduct,
}: EditOrderItemDrawerProps) {
  useOverlayedActive(isOpen);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  });
  const { isSubmitting, isDirty, isValid } = form.formState;

  const onSubmit = useMutationAPI({
    mutationFn: async (data: FormValues) => {
      return api.orders.updateItem({
        orderId,
        itemId: item.id,
        quantity: data.quantity,
        price: Math.round(data.price * 100),
      });
    },
    onSuccess: async () => {
      await invalidateQueries(["orders", orderId]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Salvando alterações...",
        description: "Estamos atualizando o item do pedido.",
      }),
      success: () => ({
        title: "Item atualizado!",
        description: "O item foi atualizado com sucesso.",
      }),
      error: () => ({
        title: "Erro ao atualizar item",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  const remove = useMutationAPI({
    mutationFn: async () => api.orders.deleteItem({ orderId, itemId: item.id }),
    onSuccess: async () => {
      await invalidateQueries(["orders", orderId]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Removendo item...",
        description: "Estamos removendo o item do pedido.",
      }),
      success: () => ({
        title: "Item removido!",
        description: "O item foi removido do pedido.",
      }),
      error: () => ({
        title: "Erro ao remover item",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        quantity: item.quantity,
        price: item.price / 100,
      });
    }
  }, [isOpen, form, item]);

  const quantity = form.watch("quantity");
  const price = form.watch("price");
  const priceNumber =
    Number(
      String(price ?? 0)
        .split(",")
        .join("."),
    ) || 0;
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Editar Item</DrawerTitle>
          <DrawerDescription>{item.name}</DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit((v) => onSubmit.mutateAsync(v as never))}
        >
          <FieldSet className="w-full px-4">
            <FieldGroup>
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Quantidade</FieldLabel>
                    <QuantityStepper
                      value={field.value}
                      onChange={field.onChange}
                      min={1}
                    />
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
                    <FieldLabel htmlFor={field.name}>Preço unitário</FieldLabel>
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
              <div className="flex items-center justify-between px-1 py-2">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-xl font-black font-mono">
                  {formatCurrency(quantity * priceNumber, 1)}
                </span>
              </div>
            </FieldGroup>
          </FieldSet>
          <DrawerFooter>
            <Button
              size={"drawer"}
              type={"submit"}
              disabled={isSubmitting || !isDirty || !isValid}
            >
              <CheckIcon />
              <span>Salvar</span>
            </Button>
          </DrawerFooter>
        </form>
        <div className="grid gap-2.5 px-4 pb-6">
          <Separator />
          <Button variant={"outline"} size={"drawer"} onClick={onEditProduct}>
            <PencilIcon />
            <span>Editar Produto</span>
          </Button>
          <Button
            variant={"destructive"}
            size={"drawer"}
            onClick={() => remove.mutateAsync()}
            disabled={remove.isPending}
          >
            <TrashIcon />
            <span>Remover Item</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
