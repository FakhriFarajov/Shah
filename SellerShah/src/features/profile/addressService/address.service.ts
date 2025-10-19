import { authHttp } from "./httpClient";
import type { AddressResponseDTO, EditAddressDto } from "@/features/profile/DTOs/profile.interfaces";


export async function getSellerAddress(id: string): Promise<AddressResponseDTO> {
  const { data } = await authHttp.get(`/Seller/${id}`);
  return data;
}
export async function editAddress(payload: EditAddressDto): Promise<{ isSuccess: boolean; message?: string }> {
  const { data } = await authHttp.put(`/Edit`, payload);
  return data;
}

