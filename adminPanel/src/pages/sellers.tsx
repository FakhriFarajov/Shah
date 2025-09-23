import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SellersPage() {
    const sellers = [
        {
            id: "s1",
            name: "Michael",
            surname: "Brown",
            email: "michael.brown@company.com",
            phone: "111-222-3333",
            isVerified: true,
            companyName: "Brown Inc.",
            taxId: "TAX123456",
            bankAccount: "BANK987654321",
            website: "https://browninc.com",
            products: [
                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                                { id: "p1", title: "Laptop", description: "High-end laptop", price: 1200, stock: 10, isVerified: true, image: "/src/assets/images/download.png", rating: 4.5 },
                { id: "p2", title: "Mouse", description: "Wireless mouse", price: 25, stock: 100, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png", rating: 3.8 },
                
            ]
        },
        {
            id: "s2",
            name: "Sara",
            surname: "Lee",
            email: "sara.lee@company.com",
            phone: "222-333-4444",
            isVerified: false,
            companyName: "Lee LLC",
            taxId: "TAX654321",
            bankAccount: "BANK123456789",
            website: "https://leellc.com",
            products: [
                { id: "p3", title: "Keyboard", description: "Mechanical keyboard", price: 80, stock: 50, isVerified: false, image: "/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom copy.png", rating: 4.2 },
                { id: "p4", title: "Monitor", description: "4K monitor", price: 400, stock: 20, isVerified: true, image: "/src/assets/images/download.png", rating: 4.9 }
            ]
        },
        {
            id: "s3",
            name: "David",
            surname: "Kim",
            email: "david.kim@company.com",
            phone: "333-444-5555",
            isVerified: true,
            companyName: "Kim & Co.",
            taxId: "TAX789123",
            bankAccount: "BANK456789123",
            website: "https://kimco.com",
            products: [
                { id: "p5", title: "Tablet", description: "Android tablet", price: 300, stock: 30, isVerified: false, image: "/src/assets/images/download.png", rating: 4.0 }
            ]
        },
    ];

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalProducts, setModalProducts] = useState<any[]>([]);
    const [modalSeller, setModalSeller] = useState<any>(null);
    const filteredSellers = sellers.filter(s =>
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.surname.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.toLowerCase().includes(search.toLowerCase()) ||
        s.bankAccount.toLowerCase().includes(search.toLowerCase()) ||
        s.website.toLowerCase().includes(search.toLowerCase()) ||
        (s.companyName && s.companyName.toLowerCase().includes(search.toLowerCase()))
    );

    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 max-w-10xl mx-auto">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>All Sellers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex justify-end">
                                <input
                                    type="text"
                                    placeholder="Search by name, surname, email, or company..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border rounded px-3 py-2 w-full max-w-sm focus:outline-none focus:ring focus:border-blue-300 shadow"
                                />
                            </div>
                            <div className="overflow-x-auto rounded-lg shadow" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="min-w-full bg-white text-left border border-gray-200">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Name</th>
                                            <th className="px-4 py-2">Surname</th>
                                            <th className="px-4 py-2">Email</th>
                                            <th className="px-4 py-2">Phone</th>
                                            <th className="px-4 py-2">Verified</th>
                                            <th className="px-4 py-2">Company</th>
                                            <th className="px-4 py-2">Tax ID</th>
                                            <th className="px-4 py-2">Bank Account</th>
                                            <th className="px-4 py-2">Website</th>
                                            <th className="px-4 py-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSellers.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="text-center py-4 text-gray-400">No sellers found.</td>
                                            </tr>
                                        ) : (
                                            filteredSellers.map((s) => (
                                                <tr key={s.id} className="hover:bg-blue-50 transition">
                                                    <td className="px-4 py-2 font-mono text-xs">{s.id}</td>
                                                    <td className="px-4 py-2 font-semibold">{s.name}</td>
                                                    <td className="px-4 py-2">{s.surname}</td>
                                                    <td className="px-4 py-2">{s.email}</td>
                                                    <td className="px-4 py-2">{s.phone}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${s.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> 
                                                            <svg width="12" height="12" fill="currentColor" className="inline"><circle cx="6" cy="6" r="6"/></svg>
                                                            {s.isVerified ? "Verified" : "Unverified"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">{s.companyName}</td>
                                                    <td className="px-4 py-2">{s.taxId}</td>
                                                    <td className="px-4 py-2">{s.bankAccount}</td>
                                                    <td className="px-4 py-2"><a href={s.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{s.website}</a></td>
                                                    <td className="px-4 py-2 text-right">
                                                        <button
                                                            title={s.isVerified ? "Ban Seller" : "Verify Seller"}
                                                            className={`mr-2 p-2 rounded-full ${s.isVerified ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} hover:scale-110 transition`}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                s.isVerified = !s.isVerified;
                                                                setModalSeller({ ...s });
                                                            }}
                                                        >
                                                            {s.isVerified ? (
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                                                            ) : (
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            title="View Products"
                                                            className="p-2 rounded-full bg-blue-100 text-blue-700 hover:scale-110 transition"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setModalProducts(s.products);
                                                                setModalSeller(s);
                                                                setModalOpen(true);
                                                            }}
                                                        >
                                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        {/* Products Modal */}
                        {modalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                                    <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => setModalOpen(false)}>&times;</button>
                                    <h2 className="text-xl font-bold mb-4">Products for {modalSeller?.name} {modalSeller?.surname}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {modalProducts.length === 0 ? (
                                            <div className="col-span-2 text-center py-4 text-gray-400">No products found.</div>
                                        ) : (
                                            modalProducts.map((p) => (
                                                <div key={p.id} className="border rounded-lg p-4 shadow flex flex-col gap-2 bg-gray-50">
                                                    <img src={p.image} alt={p.title} className="w-full h-32 object-contain rounded mb-2 bg-white border" />
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-lg">{p.title}</span>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${p.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> 
                                                            <svg width="12" height="12" fill="currentColor" className="inline"><circle cx="6" cy="6" r="6"/></svg>
                                                            {p.isVerified ? "Verified" : "Unverified"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => {
                                                                const full = p.rating >= i + 1;
                                                                const half = !full && p.rating >= i + 0.5;
                                                                return full ? (
                                                                    <svg key={i} width="16" height="16" fill="#facc15" viewBox="0 0 20 20"><polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36"/></svg>
                                                                ) : half ? (
                                                                    <svg key={i} width="16" height="16" viewBox="0 0 20 20"><defs><linearGradient id={`half${i}`}><stop offset="50%" stopColor="#facc15"/><stop offset="50%" stopColor="#e5e7eb"/></linearGradient></defs><polygon fill={`url(#half${i})`} points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36"/></svg>
                                                                ) : (
                                                                    <svg key={i} width="16" height="16" fill="#e5e7eb" viewBox="0 0 20 20"><polygon points="10,1 12.59,7.36 19.51,7.36 13.97,11.64 16.56,18 10,13.72 3.44,18 6.03,11.64 0.49,7.36 7.41,7.36"/></svg>
                                                                );
                                                            })}
                                                        </div>
                                                        <span className="text-xs text-gray-500">{p.rating.toFixed(1)}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">{p.description}</div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span>Price: <span className="font-semibold">${p.price}</span></span>
                                                        <span>Stock: <span className="font-semibold">{p.stock}</span></span>
                                                    </div>
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button
                                                            title={p.isVerified ? "Ban Product" : "Verify Product"}
                                                            className={`p-2 rounded-full ${p.isVerified ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} hover:scale-110 transition`}
                                                            onClick={() => {
                                                                p.isVerified = !p.isVerified;
                                                                setModalProducts([...modalProducts]);
                                                            }}
                                                        >
                                                            {p.isVerified ? (
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                                                            ) : (
                                                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
