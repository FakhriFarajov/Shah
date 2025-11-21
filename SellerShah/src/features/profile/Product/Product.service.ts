import { authHttp } from "./httpClient";
import type { ProductCreateRequest, ProductSyncRequest } from "@/types/productCreate.interfaces";

export async function addProduct(payload:ProductCreateRequest): Promise<any> {
  const  response  = await authHttp.post(`/add`, payload);
  return response;
}

export async function GetAllPaginatedProductAsync(storeId:string,page: number, pageSize: number): Promise<any> {
  const response = await authHttp.get(`/allPaginated`, {
    params: { page, pageSize, storeId: storeId }
  });
  return response;
}

export async function getDetails(id: string): Promise<any> {
  const response = await authHttp.get(`/getDetails/${id}`);
  return response;
}

export async function syncProduct(id: string, payload: ProductSyncRequest): Promise<any> {
  const response = await authHttp.put(`/sync/${id}`, payload);
  return response;
}

export async function getProductStatistics(productId: string, productVariantId?: string): Promise<any> {
  const params: Record<string, string> = {};
  if (productVariantId) params.productVariantId = productVariantId;
  const response = await authHttp.get(`/stats/${productId}`, { params });
  return response;
}