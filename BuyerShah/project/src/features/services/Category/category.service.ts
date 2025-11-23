import { authHttp } from "./httpClient";
import type { Category } from "../DTOs/interfaces";


export async function getCategories(): Promise<Category[]> {
  const { data } = await authHttp.get(`/all`);
  return data;
}

export async function getCategoryAttributesAndValues(id: string): Promise<any> {
  const  data  = await authHttp.get(`/${id}/getAttributesAndValues`);
  return data;
}