import Navbar from "../../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


const reviews = [
    {
        id: "r1",
        product: { id: "p1", name: "Laptop", image: "/src/assets/images/laptop.jpg" },
        seller: { id: "s1", name: "Seller A" },
        rating: 5,
        comment: "Great product! Fast delivery.",
        Date: "2023-10-01"
    },
    {
        id: "r2",
        product: { id: "p2", name: "Phone", image: "/src/assets/images/phone.jpg" },
        seller: { id: "s2", name: "Seller B" },
        rating: 4,
        comment: "Good value for money.",
        Date: "2023-09-15"
    },
];

export default function ordersBuyer() { // Accept buyer's id as prop to filter reviews

    // const navigate = useNavigate(); --- IGNORE ---
    // Mock data for buyers
    const [buyer] = useState([
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
                        <div className="max-h-[750px] overflow-y-auto">
                            {/* Reviews Section */}
                            <div className="mt-8">
                                <Card className="max-w-2xl mx-auto">
                                    <CardHeader>
                                        <CardTitle>{buyer[0].name}'s Reviews</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-4">
                                            {reviews.map(r => (
                                                <li key={r.id} className="border-b pb-4 flex gap-4 items-center">
                                                    <img src={r.product.image} alt={r.product.name} className="w-20 h-20 object-cover rounded border" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold">
                                                            Product: <a href={`/products/${r.product.id}`} className="text-blue-600 underline">{r.product.name}</a>
                                                            {" "}| Seller: <a href={`/sellers/${r.seller.id}`} className="text-blue-600 underline">{r.seller.name}</a>
                                                        </div>
                                                        <div className="text-yellow-500">Rating: {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                                                        <div className="mt-1 text-gray-700">{r.comment}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-400">{r.Date}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

