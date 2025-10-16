import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";

interface Order {
    id: number;
    buyer: string;
    product: string;
    status: string;
    date: string;
}

interface OrderDetailsModalProps {
    order: Order | null;
    onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    if (!order) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                <div className="space-y-2">
                    <div><span className="font-medium">Order ID:</span> {order.id}</div>
                    <div><span className="font-medium">Buyer:</span> {order.buyer}</div>
                    <div><span className="font-medium">Product:</span> {order.product}</div>
                    <div><span className="font-medium">Status:</span> {order.status}</div>
                    <div><span className="font-medium">Date:</span> {order.date}</div>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    // Mock data for orders
    const [orders] = useState<Order[]>([
        { id: 101, buyer: "John Doe", product: "Laptop", status: "Delivered", date: "2025-10-01" },
        { id: 102, buyer: "Jane Smith", product: "Phone", status: "Pending", date: "2025-10-03" },
        { id: 103, buyer: "Alice Johnson", product: "Tablet", status: "Shipped", date: "2025-10-05" },
        { id: 104, buyer: "Bob Brown", product: "Monitor", status: "Delivered", date: "2025-10-07" },
        { id: 105, buyer: "Charlie Davis", product: "Keyboard", status: "Cancelled", date: "2025-10-09" },
        { id: 106, buyer: "Eve Wilson", product: "Mouse", status: "Pending", date: "2025-10-10" },
    ]);
    const [filterId, setFilterId] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filteredOrders = filterId
        ? orders.filter(o => o.id.toString().includes(filterId))
        : orders;
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
    // Modal state
    const [modalOrder, setModalOrder] = useState<Order | null>(null);

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
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by Order ID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={filterId}
                                onChange={e => { setFilterId(e.target.value); setPage(1); }}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter Order ID"
                            />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="flex flex-col gap-6">
                            {paginatedOrders.map(order => (
                                <div key={order.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-2xl font-bold text-white">{order.product[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">Order #{order.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">Buyer: {order.buyer}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/3">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Product:</span> <span>{order.product}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Date:</span> <span>{order.date}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                                            <span className={`px-4 py-2 rounded-lg font-semibold shadow ${order.status === 'Delivered' ? 'bg-green-400 text-white' : order.status === 'Pending' ? 'bg-yellow-400 text-white' : order.status === 'Cancelled' ? 'bg-red-400 text-white' : 'bg-blue-400 text-white'}`}>{order.status}</span>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 text-white font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                                                onClick={() => setModalOrder(order)}
                                                title="View Details"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => alert(`Delete order #${order.id}`)}
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">Page {page} of {totalPages}</span>
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages || totalPages === 0}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <OrderDetailsModal order={modalOrder} onClose={() => setModalOrder(null)} />
        </>
    );
}

