import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { AdaptiveTable } from "../components/ui/adaptive-table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyersPage() {
    const buyers = [
        {
            id: "1",
            name: "John",
            surname: "Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
            confirmed: true
        },
        {
            id: "2",
            name: "Jane",
            surname: "Smith",
            email: "jane.smith@example.com",
            phone: "987-654-3210",
            confirmed: false
        },
        {
            id: "3",
            name: "Alice",
            surname: "Johnson",
            email: "alice.johnson@example.com",
            phone: "555-555-5555",
            confirmed: true
        },
    ];

    const [search, setSearch] = useState("");
    const filteredBuyers = buyers.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.surname.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase())
    );

    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 max-w-6xl mx-auto">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>All Buyers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex justify-end">
                                <input
                                    type="text"
                                    placeholder="Search by name, surname, or email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border rounded px-3 py-2 w-full max-w-sm focus:outline-none focus:ring focus:border-blue-300 shadow"
                                />
                            </div>
                            <div className="overflow-x-auto rounded-lg shadow" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <AdaptiveTable
                                    columns={[
                                        { key: "id", label: "ID" },
                                        { key: "name", label: "Name" },
                                        { key: "surname", label: "Surname" },
                                        { key: "email", label: "Email" },
                                        { key: "phone", label: "Phone" },
                                        { key: "actions", label: "Actions" }
                                    ]}
                                    data={filteredBuyers}
                                    actions={(b) => (
                                        <div className="flex gap-2">
                                            <button
                                                className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                onClick={() => navigate(`/buyer-details/${encodeURIComponent(b.id)}`)}
                                                title="Details"
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                                            </button>
                                            <button
                                                className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                                                onClick={() => alert(`Edit buyer ${b.name}`)}
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
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
