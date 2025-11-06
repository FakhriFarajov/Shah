import { authHttp } from "./httpClient";
import type { UpdateWarehouseRequestDTO, PaginatedResult, Warehouse, CreateWarehouseRequestDTO, Order } from "../DTOs/admin.interfaces";



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

export async function CreateWarehouseAsync(warehouse: CreateWarehouseRequestDTO): Promise<Warehouse> {
  const response = await authHttp.post<Warehouse>(`/create`, warehouse);
  return response;
}

export async function UpdateWarehouseAsync(warehouseId: string, warehouse: UpdateWarehouseRequestDTO): Promise<Warehouse> {
  const response = await authHttp.put<Warehouse>(`/update/${warehouseId}`, warehouse);
  return response;
}

export async function DeleteWarehouseAsync(warehouseId: string): Promise<void> {
  var result = await authHttp.delete(`/delete/${warehouseId}`);
  return result;
}

export async function getAllPaginatedOrders(warehouseId: string, pageNumber: number, pageSize: number = 5): Promise<PaginatedResult<Order>> {
  const response = await authHttp.get<PaginatedResult<Order>>(`/${warehouseId}/orders`, {
    params: { pageNumber, pageSize }
  });
  return response;
}
