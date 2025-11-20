import { authHttp } from "@/features/profile/Order/httpClient";

// Get paginated orders (detailed or not)
export async function getOrders(page: number, pageSize: number) {
    var result = await authHttp.get(`/getDetailed?page=${page}&pageSize=${pageSize}`);
    return result;
}

// Get order by ID
export async function getOrderById(id: string) {
    var result = await authHttp.get(`/byId/${id}`);
    return result;
}

// Update order item status (expects { Status: ... } DTO)
export async function updateOrderItemStatus(id: string, status: number) {
    var result = await authHttp.put(`/items/${id}/status`, { Status: status });
    console.log("Update order item status result:", result);
    return result;
}

