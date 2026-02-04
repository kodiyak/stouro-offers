import { Suspense } from "react";
import ManifestPage from "./_components/manifest-page";

export default function Page(props: PageProps<"/manifests/[manifestId]">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pg {...props} />
    </Suspense>
  );
}

async function Pg({ params }: PageProps<"/manifests/[manifestId]">) {
  const { manifestId } = await params;

  return <ManifestPage manifestId={manifestId} />;
}
