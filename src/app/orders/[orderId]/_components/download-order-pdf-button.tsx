import { PDFDownloadLink } from "@react-pdf/renderer";
import { DownloadIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { Api } from "@/lib/clients/api/types";
import { getOrderPosition } from "@/lib/utils";
import OrderDocument from "./order-document";

interface DownloadOrderPdfButtonProps {
  order: Api.Order;
}

function DownloadOrderPdfButton({ order }: DownloadOrderPdfButtonProps) {
  return (
    <Button
      size={"drawer"}
      className="rounded-full"
      variant={"outline"}
      asChild
    >
      <PDFDownloadLink
        document={<OrderDocument order={order} />}
        fileName={`pedido-${getOrderPosition(order?.position ?? 0)}.pdf`}
      >
        <DownloadIcon className="size-5 mr-2" />
        <span>Baixar Pedido</span>
      </PDFDownloadLink>
    </Button>
  );
}

export default memo(
  DownloadOrderPdfButton,
  (prev, next) => prev?.order.id === next.order.id,
);
