import { authHttp } from "@/features/profile/Order/httpClient";

// Get order by ID
export async function getOrderId(page, sellerId: string | null = null) {
    const path = sellerId ? `/getAll/?page=${page}&pageSize=5&sellerId=${sellerId}` : `/getAll?page=${page}&pageSize=5`;
    var result = await authHttp.get(path);
    return result;
}

// Update order item status (expects { Status: ... } DTO)
export async function updateOrderItemStatus(id: string, status: number) {
    var result = await authHttp.put(`/items/${id}/status`, { Status: status });
    return result;
}

export async function sendOrderToWarehouse(id: string, warehouseId: string) {
    var result = await authHttp.put(`/${id}/sendToWarehouse`, { WarehouseId: warehouseId });
    return result;
}