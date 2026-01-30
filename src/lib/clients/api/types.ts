export namespace Api {
  export interface Customer {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Product {
    id: string;
    name: string;
    price: number;
    icon: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Order {
    id: string;
    amountTotal: number;
    position: number;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    items: Api.OrderItem[];
    customer: Api.Customer;
  }

  export interface OrderItem {
    id: string;
    orderId: string;
    name: string;
    productId: string;
    quantity: number;
    price: number;
    amountTotal: number;
    createdAt: string;
    updatedAt: string;
  }
}
