import AppLayout from "@/components/layouts/app-layout";
import ListOrders from "./_components/list-orders";

export default function Page() {
  return (
    <AppLayout title={"Tela Inicial"}>
      <div className="flex flex-col gap-8 py-6">
        <ListOrders />
      </div>
    </AppLayout>
  );
}
