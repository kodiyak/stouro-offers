"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormLayout from "@/components/layouts/form-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { api } from "@/lib/clients/api";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/enums";
import { useCurrencyFormatter, useMutationAPI } from "@/lib/hooks";
import { cn, invalidateQueries } from "@/lib/utils";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
};

interface RegisterPaymentProps {
  customerId: string;
}

export default function RegisterPayment({ customerId }: RegisterPaymentProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrencyFormatter();
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("PIX");

  const { data: customer } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: async () => {
      return api.customers
        .getCustomer({ customerId })
        .then((res) => res.customer);
    },
  });

  const { data: ledger } = useQuery({
    queryKey: ["customers", customerId, "ledger"],
    queryFn: () => api.transactions.getLedger({ customerId }),
  });

  const balance = ledger?.balance ?? 0;
  const receivable = Math.max(0, balance);
  const credit = Math.max(0, -balance);

  const amountCents =
    amount !== null && amount > 0 ? Math.round(amount * 100) : 0;
  const isValid = amountCents > 0;

  const register = useMutationAPI({
    mutationFn: async () => {
      return api.transactions.createTransaction({
        targetType: "CUSTOMER",
        targetId: customerId,
        type: "PAYMENT",
        amount: amountCents,
        description: `Pagamento de ${customer?.name ?? "cliente"}`,
        metadata: { source: "MANUAL", method },
      });
    },
    onSuccess: async () => {
      await invalidateQueries([
        "orders",
        "financial",
        `customers/${customerId}/ledger`,
      ]);
      router.push("/financial");
    },
    toast: {
      loading: () => ({
        title: "Registrando pagamento...",
        description: "Processando o pagamento.",
      }),
      success: () => ({
        title: "Pagamento registrado!",
        description:
          "O pagamento foi aplicado às cobranças abertas do cliente.",
      }),
      error: ({ error }) => ({
        title: "Erro ao registrar pagamento",
        description: error?.message || "Tente novamente mais tarde.",
      }),
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        register.mutateAsync();
      }}
    >
      <FormLayout
        title={customer?.name ?? "..."}
        description="Registrar pagamento"
        goBack="/financial/pay"
        footer={
          <div className="flex items-center border-t px-4 py-2">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {METHOD_LABELS[method]}
              </span>
              <span className="font-mono text-xl font-black leading-none">
                {formatCurrency(amountCents)}
              </span>
            </div>
            <Button
              size={"lg"}
              type={"submit"}
              className="rounded-full px-4"
              disabled={!isValid || register.isPending}
            >
              <span className="font-bold">Registrar</span>
              <ArrowRightIcon />
            </Button>
          </div>
        }
      >
        <FieldSet>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Card className="flex flex-col gap-1 p-3">
                <span className="text-xs text-muted-foreground">A receber</span>
                <span
                  className={cn(
                    "font-mono text-lg font-bold",
                    receivable > 0 && "text-amber-500",
                  )}
                >
                  {formatCurrency(receivable)}
                </span>
              </Card>
              <Card className="flex flex-col gap-1 p-3">
                <span className="text-xs text-muted-foreground">Crédito</span>
                <span
                  className={cn(
                    "font-mono text-lg font-bold",
                    credit > 0 && "text-emerald-500",
                  )}
                >
                  {formatCurrency(credit)}
                </span>
              </Card>
            </div>

            <Field>
              <FieldLabel htmlFor="payment-amount">Valor recebido</FieldLabel>
              <CurrencyInput
                id="payment-amount"
                value={amount ?? ""}
                onChange={(value) =>
                  setAmount(typeof value === "number" ? value : null)
                }
              />
              <FieldDescription>
                Valor em reais recebido do cliente.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Método de pagamento</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((item) => (
                  <Button
                    key={item}
                    type={"button"}
                    variant={method === item ? "default" : "outline"}
                    onClick={() => setMethod(item)}
                    className="rounded-full"
                  >
                    <span className="font-bold">{METHOD_LABELS[item]}</span>
                  </Button>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FormLayout>
    </form>
  );
}
