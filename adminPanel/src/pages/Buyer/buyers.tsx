import Navbar from "../../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function BuyersPage() {
    const navigate = useNavigate();
    // Mock data for buyers
    const [buyers, setBuyers] = useState([
        { id: 1, name: "John", surname: "Doe", email: "Email", phone: "123-456-7890" },
        { id: 2, name: "Jane", surname: "Smith", email: "Email", phone: "987-654-3210" },
        { id: 3, name: "Alice", surname: "Johnson", email: "Email", phone: "555-123-4567" },
        { id: 4, name: "Bob", surname: "Brown", email: "Email", phone: "444-555-6666" },
        { id: 5, name: "Charlie", surname: "Davis", email: "Email", phone: "333-222-1111" },
        { id: 6, name: "Eve", surname: "Wilson", email: "Email", phone: "777-888-9999" },
        { id: 7, name: "Frank", surname: "Miller", email: "Email", phone: "111-222-3333" },
        { id: 8, name: "Grace", surname: "Taylor", email: "Email", phone: "666-777-8888" },
        { id: 9, name: "Hank", surname: "Anderson", email: "Email", phone: "999-000-1111" },
        { id: 10, name: "Ivy", surname: "Thomas", email: "Email", phone: "222-333-4444" },
        { id: 11, name: "Jack", surname: "Moore", email: "Email", phone: "555-666-7777" },
        { id: 12, name: "Kathy", surname: "Martin", email: "Email", phone: "888-999-0000" },
    ]);
    const [editModal, setEditModal] = useState<{ open: boolean, buyer: any }>({ open: false, buyer: null });
    const [editForm, setEditForm] = useState({ id: '', name: '', surname: '', email: '', phone: '' });
    const filteredBuyers = buyers;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Buyers</h1>
                        <p className="text-gray-500">View and manage all buyers here.</p>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="overflow-x-auto rounded-lg shadow border bg-white">
                            <div className="max-h-[750px] overflow-y-auto">
                                <AdaptiveTable
                                    columns={[
                                        { key: "id", label: "ID" },
                                        { key: "name", label: "Name" },
                                        { key: "surname", label: "Surname" },
                                        { key: "email", label: "Email" },
                                        { key: "phone", label: "Phone" },
                                        {
                                            key: "actions",
                                            label: "Actions",
                                            render: (_: any, b: any) => (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                                                        onClick={() => {
                                                            navigate(`/buyer-details`);
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                                        onClick={() => alert(`Delete buyer ${b.name}`)}
                                                        title="Delete"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    data={filteredBuyers}
                                />
                                {/* Edit Modal */}
                                {editModal.open && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                                            <h2 className="text-xl font-bold mb-4">Edit Buyer</h2>
                                            <form onSubmit={e => {
                                                e.preventDefault();
                                                setBuyers(buyers.map(b => b.id === editForm.id ? { ...editForm } : b));
                                                setEditModal({ open: false, buyer: null });
                                            }} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Name</label>
                                                    <input className="border rounded px-2 py-1 w-full" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Surname</label>
                                                    <input className="border rounded px-2 py-1 w-full" value={editForm.surname} onChange={e => setEditForm(f => ({ ...f, surname: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Email</label>
                                                    <input className="border rounded px-2 py-1 w-full" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                                    <input className="border rounded px-2 py-1 w-full" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                                                </div>
                                                <div className="flex gap-2 justify-end mt-4">
                                                    <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditModal({ open: false, buyer: null })}>Cancel</button>
                                                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

