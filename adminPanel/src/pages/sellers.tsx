import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SellersPage() {
    const navigate = useNavigate();
    // Mock data for sellers
    const [sellers, setSellers] = useState([
        { id: 1, name: "Michael", surname: "Brown", email: "michael.brown@company.com", phone: "111-222-3333", companyName: "Brown Inc." },
        { id: 2, name: "Sara", surname: "Lee", email: "sara.lee@company.com", phone: "222-333-4444", companyName: "Lee LLC" },
        { id: 3, name: "David", surname: "Kim", email: "david.kim@company.com", phone: "333-444-5555", companyName: "Kim & Co." },
    ]);
    const filteredSellers = sellers;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Sellers</h1>
                        <p className="text-gray-500">View and manage all sellers here.</p>
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
                                        { key: "companyName", label: "Company" },
                                        {
                                            key: "actions",
                                            label: "Actions",
                                            render: (_: any, s: any) => (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                                                        onClick={() => {
                                                            navigate(`/seller-details`);
                                                        }}
                                                        title="Profile"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                                        onClick={() => alert(`Delete seller ${s.name}`)}
                                                        title="Delete"
                                                    >
                                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    data={filteredSellers}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
