import { Suspense } from "react";
import CreateOrder from "@/components/forms/create-order";

export default function Page(props: PageProps<"/create/[customerId]">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/create/[customerId]">) {
  const { customerId } = await params;
  return <CreateOrder customerId={customerId} />;
}
