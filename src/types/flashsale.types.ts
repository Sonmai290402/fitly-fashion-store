export type FlashSaleData = {
  id?: string;
  title: string;
  description?: string;
  slug: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  bannerImage?: string;
  productIds: string[];
  isActive: boolean;
  badgeText?: string;
  badgeColor?: string;
  featuredOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};
