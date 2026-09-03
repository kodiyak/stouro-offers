import { CornerUpLeftIcon } from "lucide-react";
import ActivityLine from "@/app/financial/activity/_components/activity-line";
import ActivityMoneyHeader from "@/components/activity-money-header";
import AppLayout from "@/components/layouts/app-layout";
import MonthPicker from "@/components/month-picker";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <AppLayout
      title={"Extrato"}
      description="Extrato completo no período selecionado."
      className="p-0"
      goBack={"/financial"}
    >
      <MonthPicker />
      <div className="p-6">
        <ActivityMoneyHeader
          title={"Balanço"}
          value={3000_00}
          items={[
            {
              label: "Receitas",
              icon: <CornerUpLeftIcon className="size-5" />,
              value: 3000_00,
            },
          ]}
        />
      </div>
      <Separator />
      {[
        { label: "Receita 1", value: 1000_00 },
        { label: "Receita 2", value: 2000_00 },
      ].map((item, index) => (
        <ActivityLine
          key={`${item.label}.${index}`}
          title={item.label}
          value={item.value}
        />
      ))}
    </AppLayout>
  );
}
