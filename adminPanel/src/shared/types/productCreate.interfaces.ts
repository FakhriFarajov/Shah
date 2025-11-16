// Interfaces for product creation

export interface ProductImage {
  imageUrl: string;
  isMain: boolean;
}

export interface ProductVariant {
  title: string;
  description: string;
  weightInGrams: number;
  stock: number;
  price: number;
  images: ProductImage[];
  attributeValueIds: string[];
}

export interface ProductCreateRequest {
  categoryId: string;
  storeInfoId: string;
  variants: ProductVariant[];
}

// Product Sync Request Interface
export interface ProductSyncRequest {
  categoryId: string | null;
  variants: ProductVariantSync[];
}

export interface ProductVariantSync {
  id: string | null;
  title: string;
  description: string;
  weightInGrams: number;
  stock: number;
  price: number;
  images: ProductImageSync[];
  attributeValueIds: string[];
}

export interface ProductImageSync {
  id: string | null;
  imageUrl: string;
  isMain: boolean;
}