import { authHttp } from "./httpClient";
import type {AdminProfileResponseDTO, AddAdminProfileRequestDTO, EditAdminRequestDTO, PaginatedResult } from "@/features/profile/DTOs/admin.interfaces";




//Later needed to be divided into small files 
// Admin profile
export async function getAdminProfile(id: string): Promise<AdminProfileResponseDTO> {
  console.log("Fetching profile for ID:", id);
  const { data } = await authHttp.get<AdminProfileResponseDTO>(`/getProfile/${id}`);
  console.log("Get response:", data);
  return data;
}

export async function getPaginatedAdminProfiles(pageNumber: number, pageSize: number = 5): Promise<PaginatedResult<AdminProfileResponseDTO>> {
  const response = await authHttp.get<PaginatedResult<AdminProfileResponseDTO>>(`/getAllAdminsPaginated`, {
    params: { pageNumber, pageSize }
  });
  return response;
}

export async function addAdminProfile(payload: AddAdminProfileRequestDTO): Promise<any> {
  const { data } = await authHttp.post(`/add`, payload);
  return data;
}

export async function deleteAdminProfile(id: string): Promise<any> {
  const { data } = await authHttp.delete(`/delete/${id}`);
  return data;
}

export async function editAdminProfile(id: string, payload: EditAdminRequestDTO): Promise<any> {
  const { data } = await authHttp.put(`/edit/${id}`, payload);
  console.log("Edit response data:", data);
  return data;
}