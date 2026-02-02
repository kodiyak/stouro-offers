import { Suspense } from "react";
import OrderPage from "./_components/order-page";

export default function Page(props: PageProps<"/orders/[orderId]">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  return <OrderPage orderId={orderId} />;
}
