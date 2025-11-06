import { authHttp } from "./httpClient";
import type { Country } from "../DTOs/seller.interfaces";

export async function getCountries(): Promise<Country[]> {
  const { data } = await authHttp.get(`/all`);
  return data;
}

export async function getAllCategoriesWithAttributesAndValuesAsync(): Promise<any> {
  const { data } = await authHttp.get(`/all-with-attributes`);
  console.log(`Fetched attributes and values for all categories:`, data);
  return data;
}
