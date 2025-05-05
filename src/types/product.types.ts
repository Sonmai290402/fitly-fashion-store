export type ProductFilters = {
  gender?: string;
  category?: string;
  color?: string;
  size?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type PaginationState = {
  pageSize: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export type ProductData = {
  id?: string;
  title: string;
  searchableTitle?: string;
  desc: string;
  price: number;
  sale_price: number;
  gender: string;
  category: string;
  image?: string;
  colors: ProductColor[];
  totalStock?: number;
  createdAt?: string;
  date?: string;
};

export type ProductColor = {
  id?: string;
  name: string;
  colorCode: string;
  images: ProductImage[];
  sizes: ProductSize[];
  stock?: number;
};

export type ProductImage = {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
};

export type ProductSize = {
  name: string;
  inStock: number;
};
