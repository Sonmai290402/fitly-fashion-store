export type CollectionData = {
  id?: string;
  title: string;
  slug: string;
  url?: string;
  desc?: string;
  image?: string;
  productIds: string[];
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};
