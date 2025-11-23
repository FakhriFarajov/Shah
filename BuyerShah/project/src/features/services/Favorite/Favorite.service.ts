import { authHttp } from "./httpClient";

export async function addToFavourites(productVariantId?: string): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId };
  console.log("Add to favourites payload:", payload);
  const response = await authHttp.post(`Favorite/add`, payload);
  return response;
}

export async function removeFromFavourites(productVariantId?: string): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId };
  console.log("Remove from favourites payload:", payload);
  const response = await authHttp.delete(`Favorite/remove`, { data: payload, headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getFavouritesByUserId(): Promise<any> {
  const data = await authHttp.get(`Favorite/all`);
  return data;
}
