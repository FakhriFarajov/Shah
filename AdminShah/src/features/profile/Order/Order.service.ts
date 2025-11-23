import { authHttp } from "@/features/profile/Order/httpClient";

// Get order by ID
export async function getOrderId(page: number, userId: string | null = null) {
    const path = userId ? `/getAll/?page=${page}&pageSize=5&userId=${userId}` : `/getAll?page=${page}&pageSize=5`;
    var result = await authHttp.get(path);
    console.log("API response:", result);
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

export async function getByUserId(userId: string, page: number = 1, pageSize: number = 5) {
    var result = await authHttp.get(`/userId?page=${page}&pageSize=${pageSize}&userId=${userId}`);
    return result;
}