import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState, useEffect } from "react";
import { getOrderId, updateOrderItemStatus, getByUserId } from "@/features/profile/Order/Order.service";
import { getAllPaginatedWarehouses } from "@/features/profile/Warehouses/Warehouses.service";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { assignOrderItemsToWarehouse } from "@/features/profile/Warehouses/Warehouses.service";
import { toast } from "sonner";

import { getProfileImage } from "@/shared/utils/imagePost";
import { Button } from "@/components/ui/button";

const OrderStatusText: Record<number, string> = {
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
  5: "Returned"
};
const OrderStatusOptions = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Processing" },
  { value: 2, label: "Shipped" },
  { value: 3, label: "Delivered" },
  { value: 4, label: "Cancelled" },
  { value: 5, label: "Returned" }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState<number>(0);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, number>>({});
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const res = await apiCallWithManualRefresh(() => getAllPaginatedWarehouses(page, pageSize));
        setWarehouses(res?.data || []);
      } catch (e) {
        setWarehouses([]);
      }
    }
    fetchWarehouses();
  }, []);
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [selectedOrderItemIds, setSelectedOrderItemIds] = useState<string[]>([]);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingOrderItemId, setPendingOrderItemId] = useState<string | null>(null);



  const handleSendToWarehouse = async () => {
    console.log("Selected Warehouse:", selectedWarehouse);
    console.log("Pending Order Item ID:", pendingOrderId);
    console.log("Selected Order Item IDs:", selectedOrderItemIds);
    if (pendingOrderItemId && selectedWarehouse && selectedOrderItemIds.length > 0) {
      try {
        await apiCallWithManualRefresh(() =>
          assignOrderItemsToWarehouse(selectedWarehouse, pendingOrderId!, selectedOrderItemIds)
        );
        await apiCallWithManualRefresh(() =>
          updateOrderItemStatus(pendingOrderItemId, 3) // 3 = Delivered
        );
        setShowWarehouseModal(false);
        setSelectedWarehouse("");
        setPendingOrderId(null);
        setSelectedOrderItemIds([]);
        toast.success("Order items assigned to warehouse");
      } catch (err) {
        console.log("Error assigning order items to warehouse:", err);
        toast.error("Failed to assign order items to warehouse");
      }
    } else {
      toast.error("Please select at least one item to send.");
    }
  }

  async function fetchByUserId() {
    setLoading(true);
    try {
      const res = await apiCallWithManualRefresh(() => getByUserId(userIdFilter || "", page, pageSize));
      const data = Array.isArray(res?.data) ? res.data : [];
      console.log("Fetched orders data:", data);
      setTotalPages(res?.totalPages || 1);
      // Resolve images for each order's items
      const ordersWithImages = await Promise.all(
        data.map(async (order: any) => {
          const items = Array.isArray(order.items)
            ? await Promise.all(
              order.items.map(async (item: any) => {
                const resolvedImages = Array.isArray(item.images)
                  ? await Promise.all(
                    item.images.map(async (img: any) => {
                      try {
                        const url = await getProfileImage(img.imageUrl);
                        return { ...img, imageUrl: url || img.imageUrl };
                      } catch {
                        return img;
                      }
                    })
                  )
                  : [];
                return { ...item, images: resolvedImages };
              })
            )
            : [];
          return { ...order, items };
        })
      );
      setOrders(ordersWithImages);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Pass page and pageSize to getOrders
        const res = await apiCallWithManualRefresh(() => getOrderId(page));
        console.log("API response:", res);
        const data = Array.isArray(res?.data) ? res.data : [];
        console.log("Fetched orders data:", data);
        setTotalPages(res?.totalPages || 1);
        // Resolve images for each order's items
        const ordersWithImages = await Promise.all(
          data.map(async (order: any) => {
            const items = Array.isArray(order.items)
              ? await Promise.all(
                order.items.map(async (item: any) => {
                  const resolvedImages = Array.isArray(item.images)
                    ? await Promise.all(
                      item.images.map(async (img: any) => {
                        try {
                          const url = await getProfileImage(img.imageUrl);
                          return { ...img, imageUrl: url || img.imageUrl };
                        } catch {
                          return img;
                        }
                      })
                    )
                    : [];
                  return { ...item, images: resolvedImages };
                })
              )
              : [];
            return { ...order, items };
          })
        );
        if (!cancelled) setOrders(ordersWithImages);
      } catch (e) {
        if (!cancelled) setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page]);

  // Handler to change status
  // Handler to change status
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(Number(e.target.value));
  };


  const handleStatusSelect = (orderId: string, orderItemId: string, newStatus: number) => {
    setStatusUpdates(prev => ({ ...prev, [orderItemId]: newStatus }));
    if (newStatus === 3) { // 3 = Delivered
      setPendingOrderItemId(orderItemId);
      setPendingOrderId(orderId);
      // Automatically select this item for warehouse assignment
      setSelectedOrderItemIds(prev => prev.includes(orderItemId) ? prev : [...prev, orderItemId]);
      setShowWarehouseModal(true);
    }
  };

  const handleStatusUpdate = async (itemId: string) => {
    const newStatus = statusUpdates[itemId];
    if (typeof newStatus === "number") {
      try {
        await apiCallWithManualRefresh(() => updateOrderItemStatus(itemId, newStatus));
        setOrders(prev => prev.map((order: any) => ({
          ...order,
          items: order.items.map((item: any) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        })));
        console.log("Order item status updated:", itemId, newStatus);
        toast.success("Order item status updated");
      } catch (err) {
        toast.error("Failed to update item status");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex">
        <AppSidebar />
        <div className="flex-1 py-8 px-2 md:px-8">
          <div className="max-w-6xl mx-auto mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Orders</h1>
            <p className="text-lg text-gray-500 mb-4">View and manage all orders here.</p>
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="userIdFilter" className="font-medium text-gray-700">Filter by User ID:</label>
              <input
                id="userIdFilter"
                type="text"
                value={userIdFilter}
                className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter User ID..."
                onChange={e => setUserIdFilter(e.target.value)}
              />
              <Button
                variant={"outline"}
                onClick={() => fetchByUserId()}
              >
                Search
              </Button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-4">
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No orders found.</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col gap-4 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="flex flex-col gap-2 md:w-1/3">
                        <div className="font-bold text-xl text-gray-900">Order #{order.id}</div>
                        <div className="text-gray-500 text-sm">Created: {order.createdAt ? order.createdAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                        <div className="text-gray-500 text-sm">Updated: {order.updatedAt ? order.updatedAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                        <div className="text-gray-500 text-sm">Total: <span className="font-semibold">${order.totalAmount}</span></div>
                        {order.buyer && (
                          <div className="text-gray-700 text-sm mt-2">
                            <span className="font-semibold">Buyer ID:</span> {order.buyer.id}<br />
                            <span className="font-semibold">Buyer UserID:</span> {order.buyer.userId}
                          </div>
                        )}
                        {Array.isArray(order.sellers) && order.sellers.length > 0 && (
                          <div className="text-gray-700 text-sm mt-2">
                            <span className="font-semibold">Sellers:</span>
                            <ul className="ml-2 list-disc">
                              {order.sellers.map((s: any) => (
                                <li key={s.id}>
                                  <span className="font-semibold">UserID:</span> {s.userId}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 md:w-1/3">
                        <div className="font-medium text-indigo-700">Receipt</div>
                        {order.receipt ? (
                          <div className="text-sm">
                            <div>ID: {order.receipt.id}</div>
                            <div>Issued: {order.receipt.issuedAt ? order.receipt.issuedAt.slice(0, 19).replace('T', ' ') : '-'}</div>
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </div>
                      <div className="flex flex-col gap-2 md:w-1/3">
                        <div className="font-medium text-indigo-700">Payment</div>
                        {order.payment ? (
                          <div className="text-sm">
                            <div>ID: {order.payment.id}</div>
                            <div>Status: {order.payment.status}</div>
                            <div>Method: {order.payment.method}</div>
                            <div>Amount: ${order.payment.totalAmount}</div>
                            <div>Currency: {order.payment.currency}</div>
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="font-medium text-indigo-700 mb-2">Items</div>
                      <div className="flex flex-wrap gap-4">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any) => (
                            <div key={item.id} className="bg-gray-50 rounded-xl border p-4 flex flex-col items-center w-64">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 overflow-hidden">
                                {item.images && item.images.length > 0 ? (
                                  <img
                                    src={item.images[0].imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl font-bold text-white">{item.title[0]}</span>
                                )}
                              </div>
                              <div className="font-bold text-lg text-gray-900">{item.title}</div>
                              <div className="text-gray-500 text-sm">ID: {item.id}</div>
                              <div className="text-gray-500 text-sm">Variant: {item.productVariantId}</div>
                              <div className="text-gray-500 text-sm">Price: ${item.price}</div>
                              <div className="text-gray-500 text-sm">Quantity: {item.quantity}</div>
                              <div className="text-gray-500 text-sm">Line Total: ${item.lineTotal}</div>
                              <div className="text-gray-500 text-sm">Status: <span className="font-semibold">{OrderStatusText[item.status]}</span></div>

                              <div className="flex gap-2 mt-2">
                                {item.images && item.images.length > 0 ? (
                                  item.images.map((img: any, idx: number) => (
                                    <img
                                      key={idx}
                                      src={img.imageUrl}
                                      alt={item.title}
                                      className={`w-8 h-8 object-cover rounded ${img.isMain ? 'border-2 border-indigo-600' : 'border'}`}
                                    />
                                  ))
                                ) : (
                                  <span className="text-gray-400">No images</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <select
                                  value={statusUpdates[item.id] ?? item.status}
                                  onChange={e => handleStatusSelect(order.id, item.id, Number(e.target.value))}
                                  className="border rounded px-2 py-1"
                                >
                                  {OrderStatusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <button
                                  className="ml-2 px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                  onClick={() => handleStatusUpdate(item.id)}
                                  disabled={statusUpdates[item.id] === undefined || statusUpdates[item.id] === item.status}
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          ))
                        ) : <span className="text-gray-400">No items</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-gray-700">Page {page} of {totalPages}</span>
            <button
              className="px-4 py-2 rounded-xl bg-indigo-800 text-white hover:bg-indigo-300 disabled:opacity-50"
              onClick={() => {
                if (page < totalPages) setPage(page + 1);
              }}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
          {/* Modal for sending order */}
          {showModal && selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Send Order</h2>
                <div className="mb-4">
                  <label className="block font-medium mb-1 text-indigo-700">Change Status</label>
                  <select value={newStatus} onChange={handleStatusChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {OrderStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4" onClick={handleSendToWarehouse}>Send</button>
              </div>
            </div>
          )}
          {/* Modal for warehouse selection */}
          {/* Modal for warehouse selection */}
          {/* Modal for warehouse selection */}
          {showWarehouseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl" onClick={() => setShowWarehouseModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Select Warehouse</h2>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
                  value={selectedWarehouse}
                  onChange={e => setSelectedWarehouse(e.target.value)}
                >
                  <option value="">Select...</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.address.city}, {warehouse.address.state}, {warehouse.address.street}, {warehouse.address.postalCode}</option>
                  ))}
                </select>
                <button
                  className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4 disabled:opacity-60"
                  onClick={handleSendToWarehouse}
                  disabled={!selectedWarehouse}
                >
                  Send to Warehouse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}