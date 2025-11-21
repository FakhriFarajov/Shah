import { authHttp } from "./httpClient";

export async function addReview(productVariantId?: string, rating?: number, comment?: string, images?: string[]): Promise<any> {
  // send both fields when available; backend can use productVariantId preferentially
  const payload: any = { productVariantId, rating, comment, images };
  console.log("Add review payload:", payload);
  const response = await authHttp.post(`Reviews/create`, payload);
  return response;
}

export async function editReview(id: string, rating?: number, comment?: string, images?: string[]): Promise<any> {
  const payload: any = { id, rating, comment, images };
  console.log("Edit review payload:", payload);
  const response = await authHttp.put(`Reviews/update/${id}`, payload);
  return response;
}

export async function deleteReview(id: string): Promise<any> {
  console.log("Delete review id:", id);
  const response = await authHttp.delete(`Reviews/delete/${id}`, { headers: { "Content-Type": "application/json" } });
  return response;
}

export async function getReviewsByProductVariantId(productVariantId: string): Promise<any> {
  const data = await authHttp.get(`Reviews/getByVariant/${productVariantId}`);
  return data;
}

export async function getBuyerReviews(): Promise<any> {
  const data = await authHttp.get(`Reviews/getBuyerReviews`);
  console.log("Buyer reviews data:", data);
  return data;
}