import { authHttp } from "./httpClient";
import type { PaginatedResult, Warehouse, Order } from "../DTOs/interfaces";



export async function getAllPaginatedWarehouses(pageNumber: number, pageSize: number = 5): Promise<PaginatedResult<Warehouse>> {
  const response = await authHttp.get<PaginatedResult<Warehouse>>(`/getAllPaginated`, {
    params: { pageNumber, pageSize }
  });
  return response;
}

export async function GetWarehouseByIdAsync(warehouseId: string): Promise<Warehouse> {
  const response = await authHttp.get<Warehouse>(`/getById/${warehouseId}`);
  return response;
}

export async function getAllPaginatedOrders(warehouseId: string, pageNumber: number, pageSize: number = 5): Promise<PaginatedResult<Order>> {
  const response = await authHttp.get<PaginatedResult<Order>>(`/${warehouseId}/orders`, {
    params: { pageNumber, pageSize }
  });
  return response;
}
