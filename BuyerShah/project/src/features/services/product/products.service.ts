import { authHttp } from "./httpClient";
import type { ProductFilterRequest } from "@/features/services/DTOs/interfaces";

export async function getRandomPaginated(page: number, pageSize: number, userId: string): Promise<any> {
  const data = await authHttp.get(`Product/Random`, {
    params: {
      page,
      pageSize,
      userId,
    },
  });
  return data;
}

export async function getFilteredProducts(filter?: Partial<ProductFilterRequest>): Promise<any> {
  const payload: ProductFilterRequest = {
    categoryId: filter?.categoryId ?? null,
    includeChildCategories: false,
    page: filter?.page ?? 1,
    pageSize: filter?.pageSize ?? 20,
    minPrice: filter?.minPrice ?? 0,
    maxPrice: filter?.maxPrice ?? 99999,
    valueIds: filter?.valueIds ?? [],
    userId: filter?.userId ?? null,
  };

  const response = await authHttp.post(`Product/filter`, payload);
  return response;
}

export async function getProductDetailsById(productId: string): Promise<any> {
  const data = await authHttp.get(`Product/product-details/${productId}`);
  return data;
}


export async function addToFavourites(productVariantId?: string): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId };
  const response = await authHttp.post(`Favorite/add`, payload);
  return response;
}

export async function removeFromFavourites(productVariantId?: string): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId };
  const response = await authHttp.delete(`Favorite/remove`, { data: payload, headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getFavouritesByUserId(): Promise<any> {
  const data = await authHttp.get(`Favorite/all`);
  return data;
}


export async function addToCart(productVariantId?: string): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId };
  const response = await authHttp.post(`Cart/add`, payload);
  return response;
}

export async function removeFromCart(productVariantId?: string): Promise<any> {
  const response = await authHttp.delete(`Cart/delete/${productVariantId}`, { headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getCartItems(): Promise<any> {
  const data = await authHttp.get(`Cart/getAll`);
  return data;
}


export async function increaseQuantity(productVariantId: string): Promise<any> {
  // Backend expects body: { productVariantId }
  const data = await authHttp.post(`Cart/increase`, { productVariantId });
  return data;
}

export async function decreaseQuantity(productVariantId: string): Promise<any> {
  // Backend expects body: { productVariantId }
  const data = await authHttp.post(`Cart/decrease`, { productVariantId });
  return data;
}

export async function addReview(productVariantId?: string, rating?: number, comment?: string, images?: string[]): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId, rating, comment, images };
  const response = await authHttp.post(`Reviews/create`, payload);
  return response;
}

export async function editReview(id: string, rating?: number, comment?: string, images?: string[]): Promise<any> {
  const payload: any = { id, rating, comment, images };
  const response = await authHttp.put(`Reviews/update/${id}`, payload);
  return response;
}

export async function deleteReview(id: string): Promise<any> {
  const response = await authHttp.delete(`Reviews/delete/${id}`, { headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getReviewsByProductVariantId(productVariantId: string): Promise<any> {
  const data = await authHttp.get(`Reviews/getByVariant/${productVariantId}`);
  return data;
}

export async function getSearched(params: { title: string; page: number; pageSize: number }): Promise<any> {
  const data = await authHttp.get(`Product/search-by-title?title=${params.title}&page=${params.page}&pageSize=${params.pageSize}`);
  return data;
}