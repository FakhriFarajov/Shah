import { authHttp } from "./httpClient";


export async function getOrderDetails(id: string): Promise<any> {
  const response = await authHttp.get(`Order/${id}`);
  return response;
}

export async function getOrders(): Promise<any> {
  const data = await authHttp.get(`Order/buyerOrders`);
  return data;
}