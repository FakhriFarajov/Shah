import { authHttp } from "./httpClient";
import type { AdminProfileResponseDTO, EditAdminRequestDTO } from "@/features/profile/DTOs/profile.interfaces";


// Admin profile
export async function getAdminProfile(id: string): Promise<AdminProfileResponseDTO> {
  console.log("Fetching profile for ID:", id);
  const { data } = await authHttp.get(`/getProfile/${id}`);
  console.log("Get response:", data);
  return data;
}

export async function editAdminProfile(id: string, payload: EditAdminRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/editProfile/${id}`, payload);
  console.log("Edit response:", data);
  console.log("Edit payload:", payload);
  return data;
}

