import { authHttp } from "./httpClient";
import type { Country } from "../DTOs/seller.interfaces";

export async function getCountries(): Promise<Country[]> {
  const { data } = await authHttp.get(`/all`);
  return data;
}