import { Suspense } from "react";
import CreateOrder from "@/components/forms/create-order";
import SkeletonCreateOrder from "@/components/skeletons/skeleton-create-order";

export default function Page(props: PageProps<"/create/[customerId]">) {
  return (
    <Suspense fallback={<SkeletonCreateOrder />}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/create/[customerId]">) {
  const { customerId } = await params;
  return <CreateOrder customerId={customerId} />;
}
