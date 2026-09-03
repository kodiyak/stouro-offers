import { Suspense } from "react";
import AppLayout from "@/components/layouts/app-layout";
import ActivityPage from "./_components/activity-page";

export default function Page() {
  return (
    <AppLayout
      title={"Extrato"}
      description="Extrato completo no período selecionado."
      className="p-0"
      goBack={"/financial"}
    >
      <Suspense fallback={"Carregando..."}>
        <ActivityPage />
      </Suspense>
    </AppLayout>
  );
}
