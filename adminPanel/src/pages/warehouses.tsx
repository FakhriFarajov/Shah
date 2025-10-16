import { useState } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Button } from "@/components/ui/button";

interface Warehouse {
    id: number;
    name: string;
    location: string;
    capacity: number;
}

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([
        { id: 1, name: "Central Warehouse", location: "Baku", capacity: 1000 },
        { id: 2, name: "North Depot", location: "Ganja", capacity: 500 },
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
    const [form, setForm] = useState<Warehouse>({ id: 0, name: "", location: "", capacity: 0 });

    // Open modal for add/edit
    const openModal = (warehouse?: Warehouse) => {
        setEditWarehouse(warehouse || null);
        setForm(warehouse ? { ...warehouse } : { id: 0, name: "", location: "", capacity: 0 });
        setModalOpen(true);
    };
    // Save warehouse (add or edit)
    const handleSave = () => {
        if (editWarehouse) {
            setWarehouses(ws => ws.map(w => w.id === editWarehouse.id ? form : w));
        } else {
            setWarehouses(ws => [...ws, { ...form, id: Date.now() }]);
        }
        setModalOpen(false);
    };
    // Delete warehouse
    const handleDelete = (id: number) => {
        setWarehouses(ws => ws.filter(w => w.id !== id));
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Warehouses</h1>
                        <Button onClick={() => openModal()} className="mb-4">Add Warehouse</Button>
                        <div className="space-y-4">
                            {warehouses.map(w => (
                                <div key={w.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">{w.name}</div>
                                        <div className="text-gray-500">Location: {w.location}</div>
                                        <div className="text-gray-500">Capacity: {w.capacity}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => openModal(w)}>Edit</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(w.id)}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Modal Window */}
                    {modalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">{editWarehouse ? "Edit" : "Add"} Warehouse</h2>
                                <div className="space-y-3">
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Name"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    />
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Location"
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                    />
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="Capacity"
                                        type="number"
                                        min={0}
                                        value={form.capacity}
                                        onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="flex gap-2 mt-6 justify-end">
                                    <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSave}>{editWarehouse ? "Save" : "Add"}</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
