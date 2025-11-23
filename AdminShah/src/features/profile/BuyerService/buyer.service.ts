import { authHttp } from "./httpClient";
import type {BuyerProfileResponseDTO, EditBuyerRequestDTO } from "@/features/profile/DTOs/buyer.interfaces";


// Buyer profile
export async function getAllBuyerProfilesPaginated(pageNumber: number, pageSize: number = 5): Promise<any> {
  const response  = await authHttp.get<any>(`/getAll`, {
    params: { pageNumber, pageSize }
  });
  return response;
}

export async function getBuyerProfile(id: string): Promise<BuyerProfileResponseDTO> {
  const { data } = await authHttp.get<BuyerProfileResponseDTO>(`/getProfile/${id}`);
  return data;
}

export async function editBuyerProfile(id: string, payload: EditBuyerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  return data;
}

export async function deleteBuyerProfile(id: string): Promise<any> {
  const data = await authHttp.delete(`/deleteProfile/${id}`);
  return data;
}
