import { authHttp } from "./httpClient";
import type { ProductSyncRequest } from "@/shared/types/productCreate.interfaces";


export async function GetAllPaginatedProductAsync(storeId: string | null, page: number, pageSize: number): Promise<any> {
  if (storeId == null) {
    const response = await authHttp.get(`/allPaginated?pageNumber=${page}&pageSize=${pageSize}`);
    return response;
  }
  const response = await authHttp.get(`/allPaginated?storeInfoId=${storeId}&pageNumber=${page}&pageSize=${pageSize}`);
  return response;
}

export async function getBySellerId(sellerId: string): Promise<any> {
  const response = await authHttp.get(`/bySellerId/${sellerId}`);
  return response;
}

export async function getDetails(id: string): Promise<any> {
  const response = await authHttp.get(`/getDetails/${id}`);
  console.log("Received edit payload response:", response);
  return response;
}

export async function syncProduct(id: string, payload: ProductSyncRequest): Promise<any> {
  const response = await authHttp.put(`/sync/${id}`, payload);
  return response;
}

// Get product statistics for a seller
export async function getProductStatistics(productId: string, productVariantId?: string): Promise<any> {
  const params: Record<string, string> = {};
  if (productVariantId) params.productVariantId = productVariantId;
  const response = await authHttp.get(`/stats/${productId}`, { params });
  return response;
}
