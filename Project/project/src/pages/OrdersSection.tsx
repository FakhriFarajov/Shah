import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import React from "react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: ShippingAddress;
  payment: { method: string; paid: boolean };
  orderItems: OrderItem[];
}

interface OrdersSectionProps {
  orderHistory: Order[];
  orderStatusFilter: string;
  setOrderStatusFilter: (val: string) => void;
  MdAccountCircle: React.ElementType;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ orderHistory, orderStatusFilter, setOrderStatusFilter, MdAccountCircle }) => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="order-status-filter" className="font-medium">Filter by status:</label>
            <select
              id="order-status-filter"
              className="border rounded px-2 py-1"
              value={orderStatusFilter}
              onChange={e => setOrderStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <ul className="divide-y">
            {orderHistory
              .filter(order => !orderStatusFilter || order.status === orderStatusFilter)
              .map((order) => (
                <li key={order.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #{order.id}</span>
                    <span>{order.createdAt}</span>
                    <span className={`text-xs px-2 py-1 rounded ${order.status === "Delivered" ? "bg-green-200" : order.status === "Cancelled" ? "bg-red-200" : "bg-yellow-200"}`}>{order.status}</span>
                  </div>
                  <div className="ml-2 text-sm text-gray-600">Total: ${order.totalAmount}</div>
                  <div className="ml-2 text-sm text-gray-600">Shipping: {order.shippingAddress.street}, {order.shippingAddress.city}</div>
                  <div className="ml-2 mt-1">
                    <span className="font-semibold">Items:</span>
                    <ul className="ml-4 list-disc">
                      {order.orderItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <a
                            href={`/product/${item.product.id}`}
                            className="flex items-center gap-2 hover:underline"
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                          >
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="w-10 h-10 object-cover rounded mr-2 border"
                                style={{ minWidth: 40, minHeight: 40 }}
                              />
                            ) : (
                              <span className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 rounded mr-2 border" style={{ minWidth: 40, minHeight: 40 }}>
                                <MdAccountCircle size={32} />
                              </span>
                            )}
                            <span>{item.product.title}</span>
                          </a>
                          <span className="ml-2">x{item.quantity} (${item.product.price})</span>
                        </li>
                      ))}
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
