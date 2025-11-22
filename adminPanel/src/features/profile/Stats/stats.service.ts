import { authHttp } from "./httpClient";

export async function getStats(): Promise<any> {
  const response = await authHttp.get<any>(`/overview`);
  return response;
}