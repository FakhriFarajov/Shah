import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/custom/ordersTable";
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

export default function MainSellerInterface() {
    const { t } = useTranslation();
    const [goods, setGoods] = useState<Product[]>([
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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                {/* Main Content */}
                <div className="flex-1 py-8 px-2 md:px-8">
                    {/* Dashboard Header */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">{t("Admin Dashboard")}</h1>
                        <p className="text-gray-500">{t("Monitor buyer, sellers activity and sales performance.")}</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                            <div className="text-2xl font-bold text-indigo-600">$9,500</div>
                            <div className="text-gray-500 text-sm">{t("Total Sales")}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                            <div className="text-2xl font-bold text-indigo-600">{goods.length}</div>
                            <div className="text-gray-500 text-sm">{t("Products Listed")}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                            <div className="text-2xl font-bold text-indigo-600">420</div>
                            <div className="text-gray-500 text-sm">{t("Items in Stock")}</div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sales Chart Card */}
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>{t("Sales Overview")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill={chartConfig.sales.color} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Seller Info Card */}
                        <Card className="col-span-1 flex flex-col items-center justify-center p-6 shadow-lg">
                            <img
                                src="/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png"
                                alt="Seller Logo"
                                className="w-24 h-24 rounded-full mb-4 b"
                            />
                            <div className="text-lg font-semibold mb-1">{t("Your Seller Panel")}</div>
                            <div className="text-gray-500 text-sm mb-2">{t("Welcome back!")}</div>
                            <Button className="w-full mt-2" variant="outline">{t("Add New Product")}</Button>
                        </Card>
                    </div>

                    <Card className="max-w-6xl mx-auto mt-8">
                        <OrdersTable data={goods} />
                    </Card>

                </div>
            </div>
        </>
    );
}