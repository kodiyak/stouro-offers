import { PDFDownloadLink } from "@react-pdf/renderer";
import { DownloadIcon } from "lucide-react";
import { memo } from "react";
import { APP_CONFIG } from "@/app.config";
import { Button } from "@/components/ui/button";
import type { Api } from "@/lib/clients/api/types";
import OrderDocument from "./order-document";

interface DownloadOrderPdfButtonProps {
  order: Api.Order;
}

function DownloadOrderPdfButton({ order }: DownloadOrderPdfButtonProps) {
  const id = Date.now();
  return (
    <Button
      size={"drawer"}
      className="rounded-full"
      variant={"outline"}
      asChild
    >
      <PDFDownloadLink
        document={<OrderDocument order={order} />}
        fileName={`${[APP_CONFIG.pdf.filenamePrefix, order.orderNumber, id].join("-")}.pdf`}
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
