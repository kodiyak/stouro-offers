import CreateOrder from "@/components/forms/create-order";

export default async function Page({
  params,
}: PageProps<"/create/[customerId]">) {
  const { customerId } = await params;

  return <CreateOrder customerId={customerId} />;
}
