import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Api } from "@/lib/clients/api/types";
import { useDateFormatter, useLabels } from "@/lib/hooks";
import { sumBy } from "@/lib/utils";

export default function ManifestRow({ manifest }: { manifest: Api.Manifest }) {
  const { formatDate } = useDateFormatter();
  const labels = useLabels();

  const items = manifest.payload?.items ?? [];
  const quantity = sumBy(
    items,
    (item: { quantity?: number }) => item.quantity ?? 0,
  );
  const typeLabel = labels.MANIFEST_DOCUMENT_TYPE[manifest.documentType];

  return (
    <Card key={manifest.id} className="py-2">
      <div className="flex items-center gap-4 px-4">
        <FileTextIcon className="size-6 text-muted-foreground" />
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatDate(manifest.createdAt)}
            </span>
            <Badge variant="outline">{typeLabel}</Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "itens"} · {quantity}{" "}
            {quantity === 1 ? "peça" : "peças"}
          </span>
        </div>
        {manifest.fileUrl && (
          <Link
            href={manifest.fileUrl}
            target="_blank"
            className="text-sm text-muted-foreground underline"
          >
            Ver
          </Link>
        )}
      </div>
    </Card>
  );
}
