import { authHttp } from "@/features/profile/Order/httpClient";

// Get paginated orders (detailed or not)
export async function getOrders(page: number, pageSize: number) {
    var result = await authHttp.get(`/getDetailed?page=${page}&pageSize=${pageSize}`);
    return result;
}

export async function getOrderById(id: string) {
    var result = await authHttp.get(`/getById/${id}`);
    return result;
}

export async function updateOrderItemStatus(id: string, status: number) {
    var result = await authHttp.put(`/updateStatus/${id}`, { Status: status });
    console.log("Update order item status result:", result);
    return result;
}

