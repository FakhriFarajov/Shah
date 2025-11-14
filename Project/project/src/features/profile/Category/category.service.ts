import { authHttp } from "./httpClient";
import type { Category } from "../DTOs/profile.interfaces";


export async function getCategories(): Promise<Category[]> {
  const { data } = await authHttp.get(`/all`);
  console.log("Fetched categories:", data);
  return data;
}

export async function getCategoryAttributesAndValues(id: string): Promise<any> {
  const  data  = await authHttp.get(`/${id}/getAttributesAndValues`);
  console.log("Fetched category attributes and values:", data);
  return data;
}