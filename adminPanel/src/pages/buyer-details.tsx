import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";



export default function BuyerDetailsPage() {
    const navigate = useNavigate();
    const { id, name, surname } = useParams();
    // Sample data

    const orders = [
        { id: "101", seller: "Seller One", totalAmount: 500, status: "In Process", createdAt: "2025-08-18", shippingAddress: "123 Main St" },
        { id: "102", seller: "Seller Two", totalAmount: 400, status: "Done", createdAt: "2025-08-17", shippingAddress: "456 Elm St" },
        { id: "103", seller: "Seller Three", totalAmount: 300, status: "In Process", createdAt: "2025-08-16", shippingAddress: "789 Oak St" },
        { id: "104", seller: "Seller Four", totalAmount: 600, status: "Done", createdAt: "2025-08-15", shippingAddress: "321 Pine St" },
    ];

    const reviews = [
        { id: "r1", product: "Cover page", rating: 5, comment: "Great!ewqwerqwerqwerqerwjqwerhdhhsdhsdhashdfkjashdfasdhfahdfakhljsdfhafkjd  ", createdAt: "2025-08-19" },
        { id: "r2", product: "Executive Summary", rating: 4, comment: "Good.", createdAt: "2025-08-20" },
        { id: "r3", product: "Financial Analysis", rating: 3, comment: "Average quality.", createdAt: "2025-08-21" },
        { id: "r4", product: "Market Research", rating: 2, comment: "Not satisfied.", createdAt: "2025-08-22" },
        { id: "r5", product: "Business Plan", rating: 1, comment: "Poor quality.", createdAt: "2025-08-23" },
        { id: "r6", product: "Cover page", rating: 5, comment: "Great!ewqwerqwerqwerqerwjqwerhdhhsdhsdhashdfkjashdfasdhfahdfakhljsdfhafkjd  ", createdAt: "2025-08-19" },
        { id: "r7", product: "Executive Summary", rating: 4, comment: "Good.", createdAt: "2025-08-20" },
        { id: "r8", product: "Financial Analysis", rating: 3, comment: "Average quality.", createdAt: "2025-08-21" },
        { id: "r9", product: "Market Research", rating: 2, comment: "Not satisfied.", createdAt: "2025-08-22" },
        { id: "r10", product: "Business Plan", rating: 1, comment: "Poor quality.", createdAt: "2025-08-23" },
        { id: "r11", product: "Cover page", rating: 5, comment: "Great!ewqwerqwerqwerqerwjqwerhdhhsdhsdhashdfkjashdfasdhfahdfakhljsdfhafkjd  ", createdAt: "2025-08-19" },
        { id: "r12", product: "Executive Summary", rating: 4, comment: "Good.", createdAt: "2025-08-20" },
        { id: "r13", product: "Financial Analysis", rating: 3, comment: "Average quality.", createdAt: "2025-08-21" },
        { id: "r14", product: "Market Research", rating: 2, comment: "Not satisfied.", createdAt: "2025-08-22" },
        { id: "r15", product: "Business Plan", rating: 1, comment: "Poor quality.", createdAt: "2025-08-23" },


    ];
    const addresses = [
        { id: "a1", street: "123 Main St", city: "New York", state: "NY", postalCode: "10001", country: "USA" },
        { id: "a2", street: "456 Elm St", city: "Los Angeles", state: "CA", postalCode: "90001", country: "USA" },
    ];

    const [orderSearch, setOrderSearch] = useState("");
    const [reviewSearch, setReviewSearch] = useState("");
    const [addressSearch, setAddressSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "order" | "review" | "address"
    const [modalData, setModalData] = useState<any>(null);

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.seller.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.status.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress.toLowerCase().includes(orderSearch.toLowerCase())
    );
    
    const filteredReviews = reviews.filter(r =>
        r.id.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.product.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.createdAt.toLowerCase().includes(reviewSearch.toLowerCase())
    );

    // Sample buyers data
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

    const buyer = buyers.find(b => b.id === id);
    const filteredAddresses = addresses.filter(a =>
        a.id.toLowerCase().includes(addressSearch.toLowerCase()) ||
        a.street.toLowerCase().includes(addressSearch.toLowerCase()) ||
        a.city.toLowerCase().includes(addressSearch.toLowerCase()) ||
        a.state.toLowerCase().includes(addressSearch.toLowerCase()) ||
        a.postalCode.toLowerCase().includes(addressSearch.toLowerCase()) ||
        a.country.toLowerCase().includes(addressSearch.toLowerCase())
    );

    function openModal(type: string, data: any) {
        setModalType(type);
        setModalData(data);
        setModalOpen(true);
    }
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 max-w-6xl mx-auto space-y-8">
                    <div className="mb-4 flex justify-between items-between">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-600 cursor-pointer "
                        >
                            &larr; Back
                        </button>
                    </div>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Orders for Buyer {name} {surname}</CardTitle>
                            <input
                                type="text"
                                placeholder="Search orders by ID, seller, status, or address"
                                value={orderSearch}
                                onChange={e => setOrderSearch(e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring focus:border-blue-300 shadow mt-2"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg shadow" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="min-w-full text-left mb-4">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Seller</th>
                                            <th>Total Amount</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Shipping Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-gray-400">No orders found.</td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((o) => (
                                                <tr key={o.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => openModal("order", o)}>
                                                    <td>{o.id}</td>
                                                    <td>{o.seller}</td>
                                                    <td>${o.totalAmount}</td>
                                                    <td>{o.status}</td>
                                                    <td>{o.createdAt}</td>
                                                    <td>{o.shippingAddress}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Reviews</CardTitle>
                            <input
                                type="text"
                                placeholder="Search reviews by ID, product name, comment or date"
                                value={reviewSearch}
                                onChange={e => setReviewSearch(e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring focus:border-blue-300 shadow mt-2"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg shadow" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <table className="min-w-full text-left mb-4">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Product</th>
                                            <th>Rating</th>
                                            <th>Comment</th>
                                            <th>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReviews.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-gray-400">No reviews found.</td>
                                            </tr>
                                        ) : (
                                            filteredReviews.map((r) => (
                                                <tr key={r.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => openModal("review", r)}>
                                                    <td>{r.id}</td>
                                                    <td>{r.product}</td>
                                                    <td>{r.rating}</td>
                                                    <td>{r.comment.slice(0, 10)}{r.comment.length > 10 && "..."}</td>
                                                    <td>{r.createdAt}</td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Addresses</CardTitle>
                            <input
                                type="text"
                                placeholder="Search addresses by ID, street, city, state, postal code or country"
                                value={addressSearch}
                                onChange={e => setAddressSearch(e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring focus:border-blue-300 shadow mt-2"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg shadow" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                <table className="min-w-full text-left mb-4">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Street</th>
                                            <th>City</th>
                                            <th>State</th>
                                            <th>Postal Code</th>
                                            <th>Country</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAddresses.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="text-center py-4 text-gray-400">No addresses found.</td>
                                            </tr>
                                        ) : (
                                            filteredAddresses.map((a) => (
                                                <tr key={a.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => openModal("address", a)}>
                                                    <td>{a.id}</td>
                                                    <td>{a.street}</td>
                                                    <td>{a.city}</td>
                                                    <td>{a.state}</td>
                                                    <td>{a.postalCode}</td>
                                                    <td>{a.country}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Modal for details */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent style={{ maxHeight: '80vh', wordBreak: 'break-word' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {modalType === "order" && "Order Details"}
                            {modalType === "review" && "Review Details"}
                            {modalType === "address" && "Address Details"}
                        </h2>
                    </div>
                    {modalType === "order" && modalData && (
                        <div className="space-y-2">
                            <div><strong>ID:</strong> {modalData.id}</div>
                            <div><strong>Seller:</strong> {modalData.seller}</div>
                            <div><strong>Total Amount:</strong> ${modalData.totalAmount}</div>
                            <div><strong>Status:</strong> {modalData.status}</div>
                            <div><strong>Created At:</strong> {modalData.createdAt}</div>
                            <div><strong>Shipping Address:</strong> {modalData.shippingAddress}</div>
                        </div>
                    )}
                    {modalType === "review" && modalData && (
                        <div className="space-y-2">
                            <div><strong>ID:</strong> {modalData.id}</div>
                            <div><strong>Product:</strong> {modalData.product}</div>
                            <div><strong>Rating:</strong> {
                                Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{ color: i < modalData.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2em' }}>★</span>
                                ))}
                            </div>
                            <div><strong>Comment:</strong>"<span className="italic">{modalData.comment}</span>"</div>
                            <div><strong>Created At:</strong> {modalData.createdAt ? modalData.createdAt : 'N/A'}</div>
                        </div>
                    )}
                    {modalType === "address" && modalData && (
                        <div className="space-y-2">
                            <div><strong>ID:</strong> {modalData.id}</div>
                            <div><strong>Street:</strong> {modalData.street}</div>
                            <div><strong>City:</strong> {modalData.city}</div>
                            <div><strong>State:</strong> {modalData.state}</div>
                            <div><strong>Postal Code:</strong> {modalData.postalCode}</div>
                            <div><strong>Country:</strong> {modalData.country}</div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
