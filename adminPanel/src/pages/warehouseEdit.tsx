import { useState } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Button } from "@/components/ui/button";

interface Address {
    id?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface WarehouseOrder {
    id: string;
    orderId: string;
    warehouseId: string;
    createdAt: string;
    shippedAt?: string;
}

interface Warehouse {
    id?: number;
    name: string;
    location: string;
    capacity: number;
    address?: Address;
}

interface WarehouseEditProps {
    initialWarehouse?: Warehouse;
    onSave?: (warehouse: Warehouse) => void;
}

export default function WarehouseEdit({ initialWarehouse, onSave }: WarehouseEditProps) {
    const [warehouse, setWarehouse] = useState<Warehouse>(
        initialWarehouse || {
            name: "",
            location: "",
            capacity: 0,
            address: {
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: ""
            }
        }
    );
    const [orders, setOrders] = useState<WarehouseOrder[]>([
        {
            id: "wo1",
            orderId: "order1",
            warehouseId: "1",
            createdAt: new Date().toISOString(),
            shippedAt: undefined
        }
    ]);

    const handleChange = (field: keyof Warehouse, value: string | number) => {
        setWarehouse(w => ({ ...w, [field]: value }));
    };

    const handleAddressChange = (field: keyof Address, value: string) => {
        setWarehouse(w => ({
            ...w,
            address: {
                ...w.address,
                [field]: value
            }
        }));
    };

    // WarehouseOrder handlers
    const handleAddOrder = () => {
        const newOrder: WarehouseOrder = {
            id: `wo${Date.now()}`,
            orderId: `order${orders.length + 1}`,
            warehouseId: warehouse.id ? warehouse.id.toString() : "new",
            createdAt: new Date().toISOString(),
        };
        setOrders(o => [...o, newOrder]);
    };
    const handleDeleteOrder = (id: string) => {
        setOrders(o => o.filter(ord => ord.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) onSave(warehouse);
        // You can add navigation or success message here
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 flex flex-col items-center">
                    <div className="max-w-md w-full bg-white rounded-xl shadow p-8 mt-8">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
                            {warehouse.id ? "Edit Warehouse" : "Add Warehouse"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium mb-1">Name</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Warehouse Name"
                                    value={warehouse.name}
                                    onChange={e => handleChange("name", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Location</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Location"
                                    value={warehouse.location}
                                    onChange={e => handleChange("location", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Capacity</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Capacity"
                                    type="number"
                                    min={0}
                                    value={warehouse.capacity}
                                    onChange={e => handleChange("capacity", Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Address</h3>
                                <input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="Street"
                                    value={warehouse.address?.street || ""}
                                    onChange={e => handleAddressChange("street", e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="City"
                                    value={warehouse.address?.city || ""}
                                    onChange={e => handleAddressChange("city", e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="State"
                                    value={warehouse.address?.state || ""}
                                    onChange={e => handleAddressChange("state", e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="Postal Code"
                                    value={warehouse.address?.postalCode || ""}
                                    onChange={e => handleAddressChange("postalCode", e.target.value)}
                                    required
                                />
                                <input
                                    className="w-full border rounded px-3 py-2 mb-2"
                                    placeholder="Country"
                                    value={warehouse.address?.country || ""}
                                    onChange={e => handleAddressChange("country", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2 mt-6 justify-end">
                                <Button type="submit" variant="default">
                                    {warehouse.id ? "Save Changes" : "Add Warehouse"}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="max-w-md w-full bg-white rounded-xl shadow p-8 mt-8">
                        <h3 className="text-xl font-bold mb-4 text-indigo-700">Warehouse Orders</h3>
                        <Button onClick={handleAddOrder} className="mb-4">Add Warehouse Order</Button>
                        <div className="space-y-2">
                            {orders.map(order => (
                                <div key={order.id} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">Order ID: {order.orderId}</div>
                                        <div className="text-sm text-gray-500">Created At: {new Date(order.createdAt).toLocaleString()}</div>
                                        <div className="text-sm text-gray-500">Shipped At: {order.shippedAt ? new Date(order.shippedAt).toLocaleString() : "Not shipped"}</div>
                                    </div>
                                    <Button variant="destructive" onClick={() => handleDeleteOrder(order.id)}>Delete</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
