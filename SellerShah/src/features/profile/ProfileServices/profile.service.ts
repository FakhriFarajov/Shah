import { authHttp } from "./httpClient";
import type { BuyerProfileResponseDTO, EditBuyerRequestDTO } from "@/features/profile/DTOs/profile.interfaces";


// Buyer profile
export async function getBuyerProfile(id: string): Promise<BuyerProfileResponseDTO> {
  const { data } = await authHttp.get(`/getProfile/${id}`);
  return data;
}

export async function editBuyerProfile(id: string, payload: EditBuyerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  console.log("Edit response:", data);
  console.log("Edit payload:", payload);
  return data;
}

