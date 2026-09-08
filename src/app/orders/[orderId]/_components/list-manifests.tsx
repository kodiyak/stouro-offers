"use client";

import EmptyManifests from "@/components/empty/empty-manifests";
import type { Api } from "@/lib/clients/api/types";
import ManifestRow from "./manifest-row";

interface ListManifestsProps {
  manifests: Api.Manifest[];
}

export default function ListManifests({ manifests }: ListManifestsProps) {
  if (manifests.length === 0) return <EmptyManifests />;

  return (
    <div className="flex flex-col gap-2">
      {manifests.map((manifest) => {
        return <ManifestRow key={manifest.id} manifest={manifest} />;
      })}
    </div>
  );
}
