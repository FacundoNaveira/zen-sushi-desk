export type OrderStatus = "NUEVO" | "PENDIENTE" | "LISTO" | "ENTREGADO";
export type OrderOrigin = "CAJA" | "PEDIDOS_YA";
export type PaymentMethod =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEBITO"
  | "CREDITO"
  | "PEDIDOS_YA_ONLINE";
export type IncomeType = "BLANCO" | "NEGRO";

export interface Product {
  id: string;
  name: string;
  description: string;
  priceMostrador: number;
  pricePedidosYa: number;
  stock: number;
  image?: string;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  ticket: number;
  origin: OrderOrigin;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  phone?: string;
  createdAt: number; // epoch ms
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  active: boolean;
  checkedIn: boolean;
}

export const PAYMENT_TO_INCOME: Record<PaymentMethod, IncomeType> = {
  EFECTIVO: "NEGRO",
  TRANSFERENCIA: "BLANCO",
  DEBITO: "BLANCO",
  CREDITO: "BLANCO",
  PEDIDOS_YA_ONLINE: "BLANCO",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  PEDIDOS_YA_ONLINE: "PedidosYa Online",
};
