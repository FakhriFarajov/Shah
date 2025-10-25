import { authHttp } from "./httpClient";
import type { SellerProfileResponseDTO, EditSellerRequestDTO } from "@/features/profile/DTOs/profile.interfaces";


// Buyer profile
export async function getSellerProfile(id: string): Promise<SellerProfileResponseDTO> {
  const { data } = await authHttp.get(`/getProfile/${id}`);
  return data;
}

export async function editSellerProfile(id: string, payload: EditSellerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  console.log("Edit response:", data);
  console.log("Edit payload:", payload);
  return data;
}