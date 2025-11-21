import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useState, useContext, useEffect } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import { PieChart, Pie, Cell } from "recharts";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

import { AppSidebar } from "@/components/custom/sidebar";

type Product = {
    id: number;
    productName: string;
    subcategory: string;
    status: string;
    price: string;
    quantity: string;
    totalPrice: string;
    destination: string;
};

export default function Home() {
    const { t } = useTranslation();
    const [goods] = useState<Product[]>([
        {
            id: 1,
            productName: "Cover page",
            subcategory: "Cover page",
            status: "In Process",
            price: "100",
            quantity: "5",
            totalPrice: "500",
            destination: "Eddie Lake"
        },
        {
            id: 2,
            productName: "Executive Summary",
            subcategory: "Summary",
            status: "Done",
            price: "200",
            quantity: "2",
            totalPrice: "400",
            destination: "Jamik Tashpulatov"
        },
    ]);
    const [counts, setCounts] = useState({
        buyers: 12,
        sellers: 8,
        warehouses: 2,
        orders: 34,
    });

    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // Utility to generate random color
    function getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    }

    // Assign random colors to earningsData
    const earningsData = [
        { name: "Buyers", value: 8000 },
        { name: "Sellers", value: 4560 },
    ].map(e => ({ ...e, color: getRandomColor() }));

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                {/* Main Content */}
                <div className="flex-1 py-8 px-2 md:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Buyers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-3xl font-bold">{counts.buyers}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sellers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-3xl font-bold">{counts.sellers}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Users Statistics</CardTitle>
                            </CardHeader>
                            <div className="flex flex-col items-center">
                                <PieChart width={180} height={180}>
                                    <Pie
                                        data={earningsData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label
                                    >
                                        {earningsData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <div className="text-2xl font-bold mt-2">{(counts.buyers + counts.sellers).toLocaleString()} <span className="text-gray-400 text-base">Total</span></div>
                                <div className="flex flex-col gap-1 mt-2">
                                    {earningsData.map(e => (
                                        <div key={e.name} className="flex items-center gap-2 text-sm">
                                            <span className="inline-block w-3 h-3 rounded-full" style={{ background: e.color }}></span>
                                            <span>{e.name}</span>
                                            <span className="font-semibold">{e.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <CardContent>
                                <span className="text-3xl font-bold">{counts.warehouses}</span>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-3xl font-bold">{counts.orders}</span>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}