import { Suspense } from "react";
import RegisterPayment from "@/components/forms/register-payment";
import SkeletonRegisterPayment from "@/components/skeletons/skeleton-register-payment";

export default function Page(props: PageProps<"/financial/pay/[customerId]">) {
  return (
    <Suspense fallback={<SkeletonRegisterPayment />}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/financial/pay/[customerId]">) {
  const { customerId } = await params;
  return <RegisterPayment customerId={customerId} />;
}
