import { authHttp } from "@/features/profile/Order/httpClient";

// Get paginated orders (detailed or not)
export async function getOrders() {
    var result = await authHttp.get(`/getDetailed`);
    return result;
}

// Get order by ID
export async function getOrderById(id: string) {
    var result = await authHttp.get(`/byId/${id}`);
    return result;
}

// Update order status (expects { Status: ... } DTO)
export async function updateOrderStatus(id: string, status: number) {
    var result = await authHttp.put(`/${id}/status`, { Status: status });
    return result;
}

export async function sendOrderToWarehouse(id: string, warehouseId: string) {
    var result = await authHttp.put(`/${id}/sendToWarehouse`, { WarehouseId: warehouseId });
    return result;
}