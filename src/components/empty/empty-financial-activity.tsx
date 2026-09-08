import { ReceiptTextIcon } from "lucide-react";
import EmptyScreen from "./empty-screen";

export default function EmptyFinancialActivity() {
  return (
    <div className="p-4">
      <EmptyScreen
        icon={<ReceiptTextIcon className="size-8 text-muted-foreground" />}
        title={"Não há movimentações."}
        description={"Você não possui movimentações financeiras neste mês."}
      />
    </div>
  );
}
