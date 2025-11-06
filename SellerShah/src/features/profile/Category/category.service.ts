import { authHttp } from "./httpClient";
import type { Category } from "../DTOs/seller.interfaces";

export async function getCategories(): Promise<Category[]> {
  const { data } = await authHttp.get(`/all`);
  console.log("Fetched categories:", data);
  return data;
}

export async function getCategoriesTree(): Promise<Category[]> {
  const { data } = await authHttp.get(`/tree`);
  console.log("Fetched categories (tree):", data);
  return data;
}

export async function getAllCategoriesWithAttributesAndValuesAsync(): Promise<any> {
  const { data } = await authHttp.get(`/all-with-attributes`);
  console.log(`Fetched attributes and values for all categories:`, data);
  return data;
}
