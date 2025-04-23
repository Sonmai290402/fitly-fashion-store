export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  productId: string;
  variantId?: string;
}
