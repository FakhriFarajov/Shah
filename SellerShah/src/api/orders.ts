// API for fetching order dashboard data
import axios from 'axios';

export interface OrderItemRow {
  orderId: string;
  orderDate: string;
  paymentStatus: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  order: {
    id: string;
    createdAt: string;
    totalAmount: number;
    buyerProfileId: string;
  };
}

export interface DashboardResponse {
  orderItemRows: OrderItemRow[];
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
}

export async function fetchDashboardData(): Promise<DashboardResponse> {
  // Replace with your real API endpoint
  const response = await axios.get<DashboardResponse>("/api/dashboard");
  return response.data;
}
