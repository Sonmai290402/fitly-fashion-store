export interface CartItem {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  productId: string;
  variantId?: string;
  userId?: string;
  addedAt?: string;
}
