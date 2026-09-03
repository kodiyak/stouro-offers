import type {
  ManifestDocumentType,
  OrderStatus,
  PaymentGatewayId,
  ProductStatus,
  TransactionTargetType,
  TransactionType,
} from "@/lib/enums";
import type { IManifest } from "@/lib/types";
import type { TransactionMetadata } from "@/lib/utils/validations/transaction";

export namespace Api {
  export interface Customer {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      products: number;
      orders: number;
    };
  }

  export interface Product {
    id: string;
    name: string;
    price: number;
    icon: string;
    customerId: string;
    status: ProductStatus;
    createdAt: string;
    updatedAt: string;
  }

  export interface Order {
    id: string;
    amountTotal: number;
    status: OrderStatus;
    position: number;
    orderNumber: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    items: Api.OrderItem[];
    manifests: Api.Manifest[];
    customer: Api.Customer;
  }

  export interface OrderItem {
    id: string;
    orderId: string;
    name: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface Beneficiary {
    id: string;
    name: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Manifest {
    id: string;
    orderId?: string | null;
    customerId?: string | null;
    fileUrl?: string | null;
    fileType?: string | null;
    fileSize?: number | null;
    documentType: ManifestDocumentType;
    payload: IManifest & { fullText: string };
    createdAt: string;
    updatedAt: string;
  }

  export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    targetType: TransactionTargetType;
    targetId: string;
    description: string;
    metadata: TransactionMetadata;
    createdAt: string;
    updatedAt: string;
  }

  export interface OrderCancelOptions {
    orderId: string;
    status: OrderStatus;
    amountTotal: number;
    canCancel: boolean;
    reason?: string;
    gateway: PaymentGatewayId;
    gatewayLabel: string;
    customerEligible: boolean;
    refundableAmount: number;
    creditIfNoRefund: number;
  }
}
