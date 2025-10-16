import Navbar from "../../components/custom/Navbar/navbar";
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
    const [filterId, setFilterId] = useState('');
    const filteredSellers = filterId
        ? sellers.filter(s => s.id.toString().includes(filterId))
        : sellers;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Sellers</h1>
                        <p className="text-lg text-gray-500 mb-4">View and manage all sellers here.</p>
                        <div className="mb-4 flex items-center gap-2">
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by ID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={filterId}
                                onChange={e => setFilterId(e.target.value)}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter ID"
                            />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="flex flex-col gap-6">
                            {filteredSellers.map(seller => (
                                <div key={seller.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-pink-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-3xl font-bold text-white">{seller.name[0]}{seller.surname[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/4">
                                            <div className="font-bold text-xl text-gray-900">{seller.name} {seller.surname}</div>
                                            <div className="text-gray-500 text-sm mt-1">ID: {seller.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">Company: {seller.companyName}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/4">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Email:</span> <span className="truncate">{seller.email}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Phone:</span> <span>{seller.phone}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-2/4 justify-end">
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-green-400 to-green-600 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
                                                onClick={() => navigate(`/seller-profile?id=${seller.id}`)}
                                                title="Profile"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 text-white font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                                                onClick={() => navigate(`/ordersSeller?id=${seller.id}`)}
                                                title="Check Orders"
                                            >
                                                Check Orders
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-purple-400 to-purple-600 text-white font-semibold shadow hover:from-purple-500 hover:to-purple-700 transition"
                                                onClick={() => navigate(`/reviewsSeller?id=${seller.id}`)}
                                                title="Check Reviews"
                                            >
                                                Check Reviews
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => alert(`Delete seller ${seller.name}`)}
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
