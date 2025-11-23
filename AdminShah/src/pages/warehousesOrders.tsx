import { useEffect, useState } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Button } from "@/components/ui/button";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import type { Order } from "@/features/profile/DTOs/admin.interfaces";
import type { PaginatedResult } from "@/features/profile/DTOs/admin.interfaces";
import { getAllPaginatedOrders } from "@/features/profile/Warehouses/Warehouses.service";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getWarehouseOrderItems } from "@/features/profile/Warehouses/Warehouses.service";

export default function WarehousesPage() {
    // Orders and items state
    const [warehouseOrders, setWarehouseOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [showItemsModal, setShowItemsModal] = useState(false);

    const [searchParams] = useSearchParams();
    const warehouseIdFromUrl = searchParams.get("warehouseId");
    // Dialog for warehouse products
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const navigator = useNavigate();


    useEffect(() => {
        const fetchWarehouseOrders = async () => {
            setLoading(true);
            try {
                const response: PaginatedResult<Order> = await apiCallWithManualRefresh(() => getAllPaginatedOrders(warehouseIdFromUrl, page, pageSize));
                setWarehouseOrders(Array.isArray(response.data) ? response.data : []);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);
            } catch (error) {
                toast.error("Failed to fetch warehouse orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouseOrders();
    }, [page, pageSize]);

    // Fetch items for selected order when modal opens
    useEffect(() => {
        const fetchOrderItems = async () => {
            if (!selectedOrderId || !showItemsModal) return;
            setLoading(true);
            try {
                const items = await apiCallWithManualRefresh(() => getWarehouseOrderItems(warehouseIdFromUrl, selectedOrderId));
                setOrderItems(items.data);
            } catch (error) {
                toast.error("Failed to fetch order items.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrderItems();
    }, [selectedOrderId, showItemsModal]);

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <Button onClick={() => navigator(-1)} className="text-sm bg-indigo-500">← Back</Button>
                                {('Orders for Warehouse')} {warehouseIdFromUrl}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {warehouseOrders.length === 0 && !loading && (
                                <div className="text-center text-gray-500 py-8">There are no orders for this warehouse.</div>
                            )}

                            {warehouseOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center overflow-x-auto">
                                    <div>
                                        <div><span className="font-bold">Order ID:</span> {order.id}</div>
                                        <div><span className="font-bold">Total:</span> {order.totalAmount}</div>
                                        <div><span className="font-bold">Status:</span>{order.status}</div>
                                        <div><span className="font-bold">Created At:</span> {order.createdAt}</div>
                                        <div><span className="font-bold">Buyer ID:</span> {order.buyerId}</div>//Redirect to buyer details page
                                        <div><span className="font-bold">Seller ID:</span> {order.sellerId}</div> // Redirect
                                        <div><span className="font-bold">Items Count:</span> {order.itemsCount}</div>
                                    </div>
                                    <div>
                                        <Button size="sm" className="text-sm bg-indigo-500" onClick={() => {
                                            setSelectedOrderId(order.id);
                                            setShowItemsModal(true);
                                        }}>
                                            View Items
                                        </Button>
                                        {/* Modal for order items */}
                                        {showItemsModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
                                                    <button className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl" onClick={() => setShowItemsModal(false)}>&times;</button>
                                                    <h2 className="text-2xl font-bold mb-4 text-indigo-700">Order Items</h2>
                                                    {loading ? (
                                                        <div className="text-center py-8 text-gray-500">Loading...</div>
                                                    ) : orderItems.length === 0 ? (
                                                        <div className="text-center py-8 text-gray-500">No items found for this order.</div>
                                                    ) : (
                                                        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                                                            {Array.isArray(orderItems) && orderItems.map((item, idx) => (
                                                                <div key={item.id || idx} className="border rounded p-3 flex flex-col">
                                                                    <div><span className="font-bold">Item ID:</span> {item.id}</div>
                                                                    <div><span className="font-bold">Title:</span> {item.title}</div>
                                                                    <div><span className="font-bold">Quantity:</span> {item.quantity}</div>
                                                                    <div><span className="font-bold">Price:</span> {item.price}</div>
                                                                    <div><span className="font-bold">Status:</span> {item.status}</div>
                                                                    <div><span className="font-bold">Product ID:</span> {item.productId}</div>
                                                                    <div><span className="font-bold">Seller ID:</span> {item.sellerId}</div>
                                                                    <div><span className="font-bold">Warehouse ID:</span> {item.warehouseId}</div>
                                                                    <div><span className="font-bold">Created At:</span> {item.createdAt}</div>
                                                                    <div><span className="font-bold">Updated At:</span> {item.updatedAt}</div>
                                                                    {/* Add more item fields as needed */}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <Button
                                    className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1 || loading}
                                >
                                    Previous
                                </Button>
                                <span className="text-gray-700">Page {page} of {totalPages} ({totalItems} warehouses)</span>
                                <Button
                                    className="rounded-xl px-6 py-2 bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages || loading}
                                >
                                    Next
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
