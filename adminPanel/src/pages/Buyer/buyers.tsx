import Navbar from "../../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function BuyersPage() {
    const navigate = useNavigate();
    // Mock data for buyers
    const [buyers] = useState([
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
    const [filterId, setFilterId] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filteredBuyers = filterId
        ? buyers.filter(b => b.id.toString().includes(filterId))
        : buyers;
    // Pagination logic
    const totalItems = filteredBuyers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedBuyers = filteredBuyers.slice((page - 1) * pageSize, page * pageSize);


    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Buyers</h1>
                        <p className="text-lg text-gray-500 mb-4">View and manage all buyers here.</p>
                        <div className="mb-4 flex items-center gap-2">
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by ID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={filterId}
                                onChange={e => { setFilterId(e.target.value); setPage(1); }}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter ID"
                            />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="flex flex-col gap-6">
                            {paginatedBuyers.map(buyer => (
                                <div key={buyer.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-3xl font-bold text-white">{buyer.name[0]}{buyer.surname[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">{buyer.name} {buyer.surname}</div>
                                            <div className="text-gray-500 text-sm mt-1">ID: {buyer.id}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/3">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Email:</span> <span className="truncate">{buyer.email}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Phone:</span> <span>{buyer.phone}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-green-400 to-green-600 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition"
                                                onClick={() => navigate(`/buyer-details`)}
                                                title="Profile"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 text-white font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                                                onClick={() => navigate(`/ordersBuyer?id=${buyer.id}`)}
                                                title="Check Orders"
                                            >
                                                Check Orders
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-purple-400 to-purple-600 text-white font-semibold shadow hover:from-purple-500 hover:to-purple-700 transition"
                                                onClick={() => navigate(`/reviewsBuyer?id=${buyer.id}`)}
                                                title="Check Reviews"
                                            >
                                                Check Reviews
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => alert(`Delete buyer ${buyer.name}`)}
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
        </>
    );
}

