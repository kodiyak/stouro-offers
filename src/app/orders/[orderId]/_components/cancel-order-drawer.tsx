"use client";

import { useQuery } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn, invalidateQueries } from "@/lib/utils";

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

  const { data: options } = useQuery({
    enabled: isOpen,
    queryKey: ["orders", order.id, "cancel-options"],
    queryFn: async () => {
      return api.orders.getCancelOptions({ orderId: order.id });
    },
  });

  const [refund, setRefund] = useState(true);
  const [amount, setAmount] = useState<number | null>(null);

  const refundableAmount = options?.refundableAmount ?? 0;
  const amountCents =
    amount !== null && amount > 0 ? Math.round(amount * 100) : 0;
  const refundValid = amountCents > 0 && amountCents <= refundableAmount;
  const willRefund = refund && refundableAmount > 0;

  useEffect(() => {
    if (isOpen && options?.refundableAmount) {
      setRefund(true);
      setAmount(options.refundableAmount / 100);
    }
  }, [isOpen, options]);

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
              <span className="text-sm text-muted-foreground">
                Carregando...
              </span>
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
                      <Field data-invalid={!refundValid && amount !== null}>
                        <FieldLabel htmlFor="refund-amount">
                          Valor do reembolso
                        </FieldLabel>
                        <CurrencyInput
                          id="refund-amount"
                          value={amount ?? ""}
                          onChange={(value) =>
                            setAmount(typeof value === "number" ? value : null)
                          }
                        />
                        <FieldDescription
                          className={cn(
                            !refundValid &&
                              amount !== null &&
                              "text-destructive",
                          )}
                        >
                          {refundValid || amount === null
                            ? `Máximo: ${formatCurrency(refundableAmount)}`
                            : `Máximo: ${formatCurrency(refundableAmount)} — valor acima do pago`}
                        </FieldDescription>
                      </Field>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {willRefund
                        ? "O pedido será cancelado e o valor reembolsado ao cliente."
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
