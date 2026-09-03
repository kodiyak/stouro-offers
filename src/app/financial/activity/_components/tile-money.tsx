import { useCurrencyFormatter } from "@/lib/hooks/use-currency-formatter";

export default function TileMoney({
  title = "",
  value = 0,
}: {
  title?: string;
  value?: number;
}) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="text-lg font-light text-muted-foreground">{title}</span>
      <span className="text-4xl font-mono">{formatCurrency(value)}</span>
    </div>
  );
}
