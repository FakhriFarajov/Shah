import { authHttp } from "./httpClient";
import type { SellerProfileResponseDTO, EditSellerRequestDTO, PaginatedSellersResponse } from "@/features/profile/DTOs/seller.interfaces";

// Seller profile
export async function getPaginatedSellerProfiles(pageNumber: number, pageSize: number = 5): Promise<PaginatedSellersResponse> {
  const response  = await authHttp.get<PaginatedSellersResponse>(`/getAll`, {
    params: { pageNumber, pageSize }
  });
  return response;
}

export async function getSellerProfile(id: string): Promise<SellerProfileResponseDTO> {
  const { data } = await authHttp.get(`/getProfile/${id}`);
  return data;
}

export async function editSellerProfile(id: string, payload: EditSellerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  return data;
}


export async function deleteSellerProfile(id: string): Promise<any> {
  const data = await authHttp.delete(`/deleteProfile/${id}`);
  return data;
}
