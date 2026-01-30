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
}
