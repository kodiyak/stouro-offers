import { Suspense } from "react";
import SkeletonOrder from "@/components/skeletons/skeleton-order";
import OrderPage from "./_components/order-page";

export default function Page(props: PageProps<"/orders/[orderId]">) {
  return (
    <Suspense fallback={<SkeletonOrder />}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  return <OrderPage orderId={orderId} />;
}
