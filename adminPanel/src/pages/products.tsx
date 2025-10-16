import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    buyer: string;
    seller: string;
}

interface ProductDetailsModalProps {
    product: Product | null;
    onClose: () => void;
    onBuyerClick: (buyer: string) => void;
    onSellerClick: (seller: string) => void;
}

function ProductDetailsModal({ product, onClose, onBuyerClick, onSellerClick }: ProductDetailsModalProps) {
    if (!product) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl" onClick={onClose}>&times;</button>
                <h2 className="text-2xl font-bold mb-4">Product Details</h2>
                <div className="space-y-2">
                    <div><span className="font-medium">Product ID:</span> {product.id}</div>
                    <div><span className="font-medium">Name:</span> {product.name}</div>
                    <div><span className="font-medium">Price:</span> ${product.price}</div>
                    <div><span className="font-medium">Stock:</span> {product.stock}</div>
                    <div><span className="font-medium">Category:</span> {product.category}</div>
                    <div><span className="font-medium">Buyer:</span> <button className="text-blue-600 underline" onClick={() => onBuyerClick(product.buyer)}>{product.buyer}</button></div>
                    <div><span className="font-medium">Seller:</span> <button className="text-blue-600 underline" onClick={() => onSellerClick(product.seller)}>{product.seller}</button></div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const navigate = useNavigate();
    // Mock data for products
    const [products] = useState<Product[]>([
        { id: 301, name: "Laptop", price: 1200, stock: 10, category: "Electronics", buyer: "John Doe", seller: "TechStore" },
        { id: 302, name: "Phone", price: 800, stock: 25, category: "Electronics", buyer: "Jane Smith", seller: "MobileHub" },
        { id: 303, name: "Tablet", price: 600, stock: 15, category: "Electronics", buyer: "Alice Johnson", seller: "GadgetWorld" },
        { id: 304, name: "Monitor", price: 300, stock: 8, category: "Electronics", buyer: "Bob Brown", seller: "ScreenPro" },
        { id: 305, name: "Keyboard", price: 50, stock: 40, category: "Accessories", buyer: "Charlie Davis", seller: "AccessoryMart" },
        { id: 306, name: "Mouse", price: 30, stock: 50, category: "Accessories", buyer: "Eve Wilson", seller: "AccessoryMart" },
    ]);
    const [filterId, setFilterId] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const filteredProducts = filterId
        ? products.filter(p => p.id.toString().includes(filterId))
        : products;
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
    // Modal state
    const [modalProduct, setModalProduct] = useState<Product | null>(null);

    const handleBuyerClick = (buyer: string) => {
        navigate(`/profileBuyer?name=${encodeURIComponent(buyer)}`);
    };
    const handleSellerClick = (seller: string) => {
        navigate(`/profileSeller?name=${encodeURIComponent(seller)}`);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Products</h1>
                        <p className="text-lg text-gray-500 mb-4">View and manage all products here.</p>
                        <div className="mb-4 flex items-center gap-2">
                            <label htmlFor="filterId" className="font-medium text-gray-700">Filter by Product ID:</label>
                            <input
                                id="filterId"
                                type="text"
                                value={filterId}
                                onChange={e => { setFilterId(e.target.value); setPage(1); }}
                                className="border rounded px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Enter Product ID"
                            />
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto mt-4">
                        <div className="flex flex-col gap-6">
                            {paginatedProducts.map(product => (
                                <div key={product.id} className="chad-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 transition-transform hover:scale-[1.02] hover:shadow-2xl">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400 flex items-center justify-center shadow-lg mb-2 md:mb-0">
                                        <span className="text-2xl font-bold text-white">{product.name[0]}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 w-full">
                                        <div className="text-left md:w-1/3">
                                            <div className="font-bold text-xl text-gray-900">{product.name}</div>
                                            <div className="text-gray-500 text-sm mt-1">ID: {product.id}</div>
                                            <div className="text-gray-500 text-sm mt-1">Buyer: <button className="text-blue-600 underline" onClick={() => handleBuyerClick(product.buyer)}>{product.buyer}</button></div>
                                            <div className="text-gray-500 text-sm mt-1">Seller: <button className="text-blue-600 underline" onClick={() => handleSellerClick(product.seller)}>{product.seller}</button></div>
                                        </div>
                                        <div className="flex flex-col gap-1 md:w-1/3">
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Price:</span> <span>${product.price}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Stock:</span> <span>{product.stock}</span></div>
                                            <div className="flex items-center gap-2 text-gray-700"><span className="font-medium">Category:</span> <span>{product.category}</span></div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-3 md:mt-0 md:w-1/3 justify-end">
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-blue-400 to-blue-600 text-white font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                                                onClick={() => setModalProduct(product)}
                                                title="Edit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded-lg bg-gradient-to-tr from-red-400 to-red-600 text-white font-semibold shadow hover:from-red-500 hover:to-red-700 transition"
                                                onClick={() => alert(`Delete product #${product.id}`)}
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
            <ProductDetailsModal 
                product={modalProduct} 
                onClose={() => setModalProduct(null)} 
                onBuyerClick={handleBuyerClick}
                onSellerClick={handleSellerClick}
            />
        </>
    );
}
