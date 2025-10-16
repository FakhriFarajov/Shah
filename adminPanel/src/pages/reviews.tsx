import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";

export default function ReviewsPage() {
    // Mock data for reviews
    const [reviews] = useState([
        { id: 201, buyer: "John Doe", product: "Laptop", rating: 5, comment: "Great product!", date: "2025-10-01" },
        { id: 202, buyer: "Jane Smith", product: "Phone", rating: 4, comment: "Good value.", date: "2025-10-03" },
        { id: 203, buyer: "Alice Johnson", product: "Tablet", rating: 3, comment: "Average experience.", date: "2025-10-05" },
        { id: 204, buyer: "Bob Brown", product: "Monitor", rating: 5, comment: "Excellent!", date: "2025-10-07" },
        { id: 205, buyer: "Charlie Davis", product: "Keyboard", rating: 2, comment: "Not satisfied.", date: "2025-10-09" },
    ]);
    const [filterId, setFilterId] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filteredReviews = filterId
        ? reviews.filter(r => r.id.toString().includes(filterId))
        : reviews;
    const totalItems = filteredReviews.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Reviews</h1>
                        <p className="text-lg text-gray-500 mb-4">View and manage all reviews here.</p>
                        <div className="mb-4 flex items-center gap-2">
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by Review ID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={filterId}
                                onChange={e => { setFilterId(e.target.value); setPage(1); }}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter Review ID"
                            />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="flex flex-col gap-6">
                            {paginatedReviews.map(review => (
                                <div key={review.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-2xl font-bold text-white">{review.rating}★</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">Review #{review.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">Buyer: {review.buyer}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/3">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Product:</span> <span>{review.product}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Date:</span> <span>{review.date}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                                            <span className="px-4 py-2 rounded-lg font-semibold shadow bg-blue-400 text-white">{review.comment}</span>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => alert(`Delete review #${review.id}`)}
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
