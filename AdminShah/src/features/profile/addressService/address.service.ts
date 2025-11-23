import { authHttp } from "./httpClient";
import type { AddressResponseDTO, AddAddressDto, EditAddressDto } from "@/features/profile/DTOs/buyer.interfaces";


export async function getBuyerAddress(id: string): Promise<AddressResponseDTO> {
  const { data } = await authHttp.get(`/Buyer/${id}`);
  return data;
}

export async function addAddress(payload: AddAddressDto): Promise<{ isSuccess: boolean; message?: string }> {
  const { data } = await authHttp.post(`/Add`, payload);
  return data;
}

export async function editAddress(payload: EditAddressDto): Promise<{ isSuccess: boolean; message?: string }> {
  const { data } = await authHttp.put(`/Edit`, payload);
  return data;
}

