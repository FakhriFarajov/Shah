import { authHttp } from "./httpClient";
import type { Category } from "../DTOs/profile.interfaces";

export async function getCategories(): Promise<Category[]> {
  const { data } = await authHttp.get(`/all`);
  console.log("Fetched categories:", data);
  return data;
}