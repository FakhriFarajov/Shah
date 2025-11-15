import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { getOrderDetails, getOrders } from "@/features/profile/Order/Order.service";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getProfileImage } from "@/shared/utils/imagePost";

export interface OrderResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  data: OrderData;
}

export interface OrderData {
  id: string;
  status: number;
  createdAt: string;
  updatedAt: string | null;
  totalAmount: number;
  receipt: Receipt;
  payment: Payment;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  status: number;
  createdAt: string;
  totalAmount: number;
  itemCount: number;
  paymentStatus: number;
  receiptId: string;
}

export interface Receipt {
  id: string;
  fileUrl: string;
  issuedAt: string;
}

export interface Payment {
  id: string;
  totalAmount: number;
  currency: string;
  method: number;
  status: number;
  gatewayTransactionId: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productVariantId: string;
  title: string;
  price: number;
  quantity: number;
  status: number;
  images: ProductImage[];
  lineTotal: number;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
  productVariantId: string;
  productVariant: any | null;
}

interface OrdersSectionProps {
  orderStatusFilter: string;
  setOrderStatusFilter: (val: string) => void;
  MdAccountCircle: React.ElementType;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ orderStatusFilter, setOrderStatusFilter, MdAccountCircle }) => {
  const [orderHistory, setOrderHistory] = React.useState<OrderData[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
          const res = await apiCallWithManualRefresh(() => getOrders());
          const summaries: any[] = Array.isArray(res)
            ? res
            : Array.isArray((res as any)?.data)
            ? (res as any).data
            : [];

          const details: OrderData[] = await Promise.all(
            summaries.map(async (s: any) => {
              const id = s?.id ?? s?.orderId ?? s?.ID;
              const detailRes = await apiCallWithManualRefresh(() => getOrderDetails(id));
              const orderData: any = (detailRes as any)?.data ?? detailRes;

              // Resolve item image URLs
              const normalizedItems = Array.isArray(orderData?.items)
                ? await Promise.all(
                    (orderData.items as OrderItem[]).map(async (it) => {
                      const resolvedImages = Array.isArray(it.images)
                        ? await Promise.all(
                            it.images.map(async (img) => {
                              try {
                                const url = await getProfileImage(img.imageUrl);
                                return { ...img, imageUrl: url || img.imageUrl };
                              } catch {
                                return img;
                              }
                            })
                          )
                        : [];
                      return { ...it, images: resolvedImages };
                    })
                  )
                : [];

              return { ...orderData, items: normalizedItems } as OrderData;
            })
          );

          if (!cancelled) setOrderHistory(details);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load orders:", e);
          setOrderHistory([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Order status is now per item, not per order
  // Filter orders by item status
  const filteredOrders = orderHistory.filter(order => {
    if (!orderStatusFilter) return true;
    // Show order if any item matches the filter
    return order.items.some(item => item.status?.toString() === orderStatusFilter);
  });

  // Helper for item status label and color
  function getItemStatusInfo(status: number) {
    switch (status) {
      case 0: return { label: "Pending", color: "bg-yellow-200" };
      case 1: return { label: "Shipped", color: "bg-blue-200" };
      case 2: return { label: "Delivered", color: "bg-green-200" };
      case 3: return { label: "Cancelled", color: "bg-red-200" };
      default: return { label: "Unknown", color: "bg-gray-200" };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="order-status-filter" className="font-medium">
              Filter by item status:
            </label>
            <select
              id="order-status-filter"
              className="border rounded px-2 py-1"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="0">Pending</option>
              <option value="1">Shipped</option>
              <option value="2">Delivered</option>
              <option value="3">Cancelled</option>
            </select>
          </div>

          <ul className="divide-y">
            {filteredOrders.map((order) => (
              <li key={order.id} className="py-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Order #{order.id}</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">Total: ${order.totalAmount}</span>
                </div>

                <div className="ml-2 mt-1">
                  <span className="font-semibold">Items:</span>
                  <ul className="ml-4 list-disc">
                    {order.items.map((item) => {
                      const statusInfo = getItemStatusInfo(item.status);
                      return (
                        <li key={item.id} className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0].imageUrl}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded mr-2 border"
                                style={{ minWidth: 40, minHeight: 40 }}
                              />
                            ) : (
                              <span
                                className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 rounded mr-2 border"
                                style={{ minWidth: 40, minHeight: 40 }}
                              >
                                <MdAccountCircle size={32} />
                              </span>
                            )}
                            <span>{item.title}</span>
                          </div>
                          <span className="ml-2">
                            x{item.quantity} (${item.price})
                          </span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSection;