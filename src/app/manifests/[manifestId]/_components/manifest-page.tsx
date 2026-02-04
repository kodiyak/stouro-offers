"use client";

import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/app-layout";
import { api } from "@/lib/clients/api";

interface ManifestPageProps {
  manifestId: string;
}

export default function ManifestPage({ manifestId }: ManifestPageProps) {
  const { data: manifest } = useQuery({
    queryKey: ["manifests", manifestId],
    queryFn: async () => {
      return api.manifests
        .getManifest({ manifestId })
        .then((res) => res.manifest);
    },
  });

  if (!manifest) return <>Loading...</>;

  return <AppLayout title={`Ficha #${manifest.manifestNumber}`}></AppLayout>;
}
