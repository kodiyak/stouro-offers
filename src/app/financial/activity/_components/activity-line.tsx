import { useCurrencyFormatter } from "@/lib/hooks/use-currency-formatter";

interface ActivityLineProps {
  title: string;
  value: number;
}

export default function ActivityLine({ title, value }: ActivityLineProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex-1 flex flex-col">
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>
      <span className="self-start text-sm font-mono">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
