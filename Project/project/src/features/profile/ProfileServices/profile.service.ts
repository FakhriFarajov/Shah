import { authHttp } from "./httpClient";
import type { BuyerProfileResponseDTO, EditBuyerRequestDTO } from "@/features/profile/DTOs/interfaces";


// Buyer profile
export async function getBuyerProfile(id: string): Promise<BuyerProfileResponseDTO> {
  console.log("Fetching profile for ID:", id);
  const { data } = await authHttp.get(`/getProfile/${id}`);
  console.log("Get response:", data);
  return data;
}

export async function editBuyerProfile(id: string, payload: EditBuyerRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  console.log("Edit response:", data);
  console.log("Edit payload:", payload);
  return data;
}

