import { authHttp } from "./httpClient";
import type { PaginatedResult, Warehouse,  Order } from "../DTOs/seller.interfaces";


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

export async function assignOrderItemsToWarehouse(warehouseId: string, orderId: string, orderItemIds: string[]): Promise<void> {
  await authHttp.post(`/${warehouseId}/assign-order-items/${orderId}`, {
    OrderItemIds: orderItemIds
  });
}