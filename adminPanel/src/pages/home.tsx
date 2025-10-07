import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Navbar from "../components/custom/Navbar/navbar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

import { AppSidebar } from "@/components/custom/sidebar";

const chartData = [
    { month: "Jan", sales: 1200 },
    { month: "Feb", sales: 1900 },
    { month: "Mar", sales: 1700 },
    { month: "Apr", sales: 2100 },
    { month: "May", sales: 2500 },
    { month: "Jun", sales: 2300 },
    { month: "Jul", sales: 2000 },
    { month: "Aug", sales: 2200 },
    { month: "Sep", sales: 2400 },
    { month: "Oct", sales: 2600 },
    { month: "Nov", sales: 2800 },
    { month: "Dec", sales: 3000 },
];
const chartConfig = {
    sales: {
        label: "Sales",
        color: "#353ec1ff",
    },
};

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
    const [counts] = useState({
        buyers: 12,
        sellers: 8,
        warehouses: 2,
        orders: 34,
    });

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
                                <CardTitle>Warehouses</CardTitle>
                            </CardHeader>
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