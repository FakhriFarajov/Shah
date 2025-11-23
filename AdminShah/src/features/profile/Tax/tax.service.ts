import { authHttp } from "./httpClient";
import type { Tax } from "@/features/profile/DTOs/seller.interfaces";

export async function getTaxes(): Promise<Tax[]> {
  const { data } = await authHttp.get(`/all`);
  return data;
}