import { ComponentExample } from "@/components/component-example";
import AppLayout from "@/components/layouts/app-layout";

export default function Page() {
  return (
    <AppLayout title={"Tela Inicial"}>
      <ComponentExample />
    </AppLayout>
  );
}
