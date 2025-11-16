import { authHttp } from "./httpClient";
import type { ProductCreateRequest, ProductSyncRequest } from "@/shared/types/productCreate.interfaces";

export async function addProduct(payload:ProductCreateRequest): Promise<any> {
  const  response  = await authHttp.post(`/add`, payload);
  return response;
}

export async function GetAllPaginatedProductAsync(page: number, pageSize: number): Promise<any> {
  const response = await authHttp.get(`/allPaginated`, {
    params: { page, pageSize, }
  });
  return response;
}

export async function getProductEditPayloadById(id: string): Promise<any> {
  const response = await authHttp.get(`/${id}/edit-payload`);
  console.log("Received edit payload response:", response);
  return response;
}


export async function syncProduct(id: string, payload: ProductSyncRequest): Promise<any> {
  const response = await authHttp.put(`/${id}/sync`, payload);
  return response;
}

// Get product statistics for a seller
export async function getProductStatistics(productId: string, productVariantId?: string): Promise<any> {
  const params: Record<string, string> = {};
  if (productVariantId) params.productVariantId = productVariantId;
  const response = await authHttp.get(`/${productId}/statistics`, { params });
  return response;
}