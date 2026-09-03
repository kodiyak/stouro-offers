import { db } from "../clients/db";
import type { TransactionType } from "../enums";

// Fuso de referência do financeiro: America/Sao_Paulo (UTC-3, sem DST desde
// 2019). As transações são instantes UTC; para agrupar/filtrar por mês "local"
// usamos o deslocamento fixo: meia-noite em SP = 03:00 UTC.
const BR_OFFSET_MS = 3 * 60 * 60 * 1000;

export interface FinancialTotals {
  balance: number;
  charged: number;
  paid: number;
  refunds: number;
  receivedNet: number;
}

export interface FinancialCustomerBalance {
  id: string;
  name: string;
  color: string;
  balance: number;
}

export interface FinancialMonthBalance {
  month: string; // "yyyy-MM"
  opening: number;
  closing: number;
}

const emptyTotals = (): FinancialTotals => ({
  balance: 0,
  charged: 0,
  paid: 0,
  refunds: 0,
  receivedNet: 0,
});

function isRefund(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }
  return typeof (metadata as Record<string, unknown>).orderId === "string";
}

function accumulate(
  totals: FinancialTotals,
  row: { amount: number; type: TransactionType; metadata: unknown },
) {
  totals.balance += row.amount;

  if (row.type === "CHARGE") {
    totals.charged += row.amount;
  } else if (row.type === "PAYMENT") {
    // PAYMENT é gravado negativo — inverte para exibir o recebido.
    totals.paid -= row.amount;
  } else if (row.type === "ADJUSTMENT" && isRefund(row.metadata)) {
    totals.refunds += row.amount;
  }
  // REVERSAL (estorno de cobrança) não é dinheiro: entra só no balance.
}

function finish(totals: FinancialTotals): FinancialTotals {
  totals.receivedNet = totals.paid - totals.refunds;
  return totals;
}

function monthStart(month: string): Date {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthIndex - 1, 1) + BR_OFFSET_MS);
}

function monthToIndex(month: string): number {
  const [year, monthIndex] = month.split("-").map(Number);
  return year * 12 + (monthIndex - 1);
}

function indexToMonth(index: number): string {
  const year = Math.floor(index / 12);
  const monthIndex = (index % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(monthIndex).padStart(2, "0")}`;
}

/**
 * Visão geral (tela Financeiro): todos os clientes ativos com saldo atual
 * ("a receber" se > 0, crédito se < 0) + totais acumulados de sempre.
 */
export async function getFinancialOverview() {
  const customers = await db.customer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, color: true },
  });

  const rows = await db.transaction.findMany({
    where: { targetType: "CUSTOMER" },
    select: { targetId: true, type: true, amount: true, metadata: true },
  });

  const totals = emptyTotals();
  const balanceByCustomer = new Map<string, number>();

  for (const row of rows) {
    accumulate(totals, row);
    balanceByCustomer.set(
      row.targetId,
      (balanceByCustomer.get(row.targetId) ?? 0) + row.amount,
    );
  }

  const customersWithBalance: FinancialCustomerBalance[] = customers
    .map((customer) => ({
      ...customer,
      balance: balanceByCustomer.get(customer.id) ?? 0,
    }))
    .sort((a, b) => b.balance - a.balance);

  return { customers: customersWithBalance, totals: finish(totals) };
}

/**
 * Extrato do período (tela Financeiro > Extrato): movimentações do mês com o
 * cliente resolvido, totais do mês e saldo (abertura/fechamento) do mês
 * selecionado + 3 meses anteriores para detalhes na UI.
 */
export async function getFinancialActivity({ month }: { month: string }) {
  const selectedIndex = monthToIndex(month);
  const start = monthStart(month);
  const end = monthStart(indexToMonth(selectedIndex + 1));

  const rows = await db.transaction.findMany({
    where: { targetType: "CUSTOMER", createdAt: { lt: end } },
    orderBy: { createdAt: "asc" },
  });

  const balances: FinancialMonthBalance[] = [];
  for (let back = 3; back >= 0; back--) {
    const index = selectedIndex - back;
    const from = monthStart(indexToMonth(index));
    const to = monthStart(indexToMonth(index + 1));
    let opening = 0;
    let closing = 0;

    for (const row of rows) {
      if (row.createdAt < from) {
        opening += row.amount;
      }
      if (row.createdAt < to) {
        closing += row.amount;
      }
    }

    balances.push({
      month: indexToMonth(index),
      opening,
      closing,
    });
  }

  const monthRows = rows.filter((row) => {
    return row.createdAt >= start && row.createdAt < end;
  });

  const totals = emptyTotals();
  for (const row of monthRows) {
    accumulate(totals, row);
  }
  finish(totals);

  const targetIds = [...new Set(monthRows.map((row) => row.targetId))];
  const customers =
    targetIds.length > 0
      ? await db.customer.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true, color: true },
        })
      : [];
  const customerById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );

  const items = monthRows
    .map((row) => ({
      ...row,
      customer: customerById.get(row.targetId) ?? null,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { month, items, totals, balances };
}
