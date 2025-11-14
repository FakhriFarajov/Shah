import { authHttp } from "./httpClient";

export async function getCartItems(): Promise<any> {
  const data = await authHttp.get(`Cart/getAll`);
  return data;
}


export async function increaseQuantity(productVariantId: string): Promise<any> {
  // Backend expects body: { productVariantId }
  const data = await authHttp.post(`Cart/increase`, { productVariantId });
  return data;
}

export async function decreaseQuantity(productVariantId: string): Promise<any> {
  // Backend expects body: { productVariantId }
  const data = await authHttp.post(`Cart/decrease`, { productVariantId });
  return data;
}


