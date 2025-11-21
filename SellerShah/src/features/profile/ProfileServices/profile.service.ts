import { authHttp } from "./httpClient";
import type { SellerProfileResponseDTO, EditSellerRequestDTO } from "@/features/profile/DTOs/seller.interfaces";


// Buyer profile
export async function getSellerProfile(id: string): Promise<SellerProfileResponseDTO> {
  const { data } = await authHttp.get(`/getProfile/${id}`);
  return data;
}

export async function editSellerProfile(id: string, payload: EditSellerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  return data;
}