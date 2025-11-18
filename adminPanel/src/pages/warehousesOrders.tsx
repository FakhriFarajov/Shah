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


export default function WarehousesPage() {
    // Orders and items state
    const [warehouseOrders, setWarehouseOrders] = useState<Order[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <Button onClick={() => navigator(-1)} className="text-sm text-indigo-600 bg-transparent hover:text-indigo-500 hover:bg-indigo-100">← Back</Button>
                                {('Orders for Warehouse')} {warehouseIdFromUrl}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {warehouseOrders.length === 0 && !loading && (
                                <div className="text-center text-gray-500 py-8">There are no orders for this warehouse.</div>
                            )}

                            {warehouseOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
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

                                        <Button size="sm" className="mt-2" onClick={() => {
                                            setSelectedOrderId(order.id);
                                        }}>
                                            View Items
                                        </Button>
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
