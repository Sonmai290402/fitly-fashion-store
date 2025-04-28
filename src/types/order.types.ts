import { FieldValue } from "firebase/firestore";

export type OrderData = {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress: AddressData;
  subtotal: number;
  total: number;
  shippingCost?: number;
  discount?: number;
  paymentMethod: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
  estimatedDeliveryDate?: string;
  cancellationReason?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  statusHistory: StatusHistoryItem[];
};

export type OrderItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  variantId?: string;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type AddressData = {
  fullName: string;
  detailAddress: string;
  district: string;
  city: string;
  phoneNumber: string;
};

export type StatusHistoryItem = {
  status: OrderStatus;
  timestamp: string;
  comment?: string;
};
