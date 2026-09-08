"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { useOverlayedActive } from "@/components/providers/overlayed-provider";
import SkeletonCancelOrder from "@/components/skeletons/skeleton-cancel-order";
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
import { api } from "@/lib/clients/api";
import type { Api } from "@/lib/clients/api/types";
import {
  type UseDisclosure,
  useCurrencyFormatter,
  useMutationAPI,
} from "@/lib/hooks";
import { invalidateQueries } from "@/lib/utils";

const schema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "number" ? val : Number((val ?? "").split(",").join(".")),
    )
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: "Informe um valor maior que zero",
    }),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  return Number((value ?? "").split(",").join("."));
}

interface CancelOrderDrawerProps extends UseDisclosure {
  order: Api.Order;
}

export default function CancelOrderDrawer({
  isOpen,
  onOpenChange,
  onClose,
  order,
}: CancelOrderDrawerProps) {
  useOverlayedActive(isOpen);
  const { formatCurrency } = useCurrencyFormatter();
  const [refund, setRefund] = useState(true);

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { amount: "" },
  });

  const rawAmount = useWatch<FormInput>({
    control: form.control,
    name: "amount",
  });

  const amountCents = Math.round(toNumber(rawAmount) * 100);

  const { data: options } = useQuery({
    enabled: isOpen,
    queryKey: ["orders", order.id, "cancel-options"],
    queryFn: async () => {
      return api.orders.getCancelOptions({ orderId: order.id });
    },
  });

  const refundableAmount = options?.refundableAmount ?? 0;
  const willRefund = refund && refundableAmount > 0;
  const refundValid = amountCents > 0 && amountCents <= refundableAmount;

  // Valor padrão: reembolso integral assim que as opções carregam.
  useEffect(() => {
    if (isOpen && refundableAmount > 0) {
      form.setValue("amount", refundableAmount / 100, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [form, isOpen, refundableAmount]);

  const cancel = useMutationAPI({
    mutationFn: async () => {
      return api.orders.cancel({
        orderId: order.id,
        refund: willRefund && refundValid ? { amount: amountCents } : undefined,
      });
    },
    onSuccess: async () => {
      await invalidateQueries(["orders", order.id]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Cancelando pedido...",
        description: "Processando o cancelamento.",
      }),
      success: () => ({
        title: "Pedido cancelado!",
        description: willRefund
          ? "O valor foi reembolsado ao cliente."
          : "O valor pago virou crédito para o cliente.",
      }),
      error: ({ error }) => ({
        title: "Erro ao cancelar pedido",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  const canSubmit = Boolean(options?.canCancel && (!willRefund || refundValid));

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Cancelar Pedido</DrawerTitle>
          <DrawerDescription>
            Configure como o cancelamento deve ser feito.
          </DrawerDescription>
        </DrawerHeader>
        <FieldSet className="w-full px-4">
          <FieldGroup>
            {!options ? (
              <SkeletonCancelOrder />
            ) : !options.canCancel ? (
              <span className="text-sm text-muted-foreground">
                Este pedido não pode mais ser cancelado.
              </span>
            ) : (
              <>
                {refundableAmount > 0 && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        Valor pago
                      </span>
                      <span className="font-mono text-2xl font-extrabold">
                        {formatCurrency(refundableAmount)}
                      </span>
                    </div>

                    {!options.customerEligible && (
                      <span className="text-sm text-destructive">
                        Cliente não está apto ao cancelamento.
                      </span>
                    )}

                    <Field>
                      <FieldLabel>O que fazer com o valor?</FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={refund ? "default" : "outline"}
                          onClick={() => setRefund(true)}
                          className="rounded-full"
                        >
                          <span className="font-bold">
                            Reembolsar ({options.gatewayLabel})
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant={!refund ? "default" : "outline"}
                          onClick={() => setRefund(false)}
                          className="rounded-full"
                        >
                          <span className="font-bold">Virar crédito</span>
                        </Button>
                      </div>
                    </Field>

                    {willRefund && (
                      <Controller
                        name="amount"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                              Valor do reembolso
                            </FieldLabel>
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
                    )}

                    <span className="text-xs text-muted-foreground">
                      {willRefund
                        ? `O pedido será cancelado e ${formatCurrency(amountCents)} reembolsado ao cliente.`
                        : "O pedido será cancelado e o valor pago fica como crédito para o próximo pedido."}
                    </span>
                  </>
                )}

                {refundableAmount === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Este pedido não tem valor pago — a cobrança será estornada.
                  </span>
                )}
              </>
            )}
          </FieldGroup>
        </FieldSet>
        <DrawerFooter>
          <Button
            variant="destructive"
            size="drawer"
            onClick={() => cancel.mutateAsync()}
            disabled={!canSubmit || cancel.isPending}
          >
            <TrashIcon />
            <span>Cancelar Pedido</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
