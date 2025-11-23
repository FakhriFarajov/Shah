import { useEffect, useState } from "react";
import Navbar from "@/components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getStats } from "@/features/profile/Stats/stats.service";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import type { AdaptiveTableColumn } from "@/components/custom/adaptive-table";
import { getImage } from "@/shared/utils/imagePost";
import Spinner from "@/components/custom/Spinner";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);


export default function HomePage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orderRows, setOrderRows] = useState<any[]>([]);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const result = await apiCallWithManualRefresh(() => getStats());
                setStats(result);
            } catch (err) {
                if(err.response.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    window.location.href = "/login";
                } else {
                    toast.error("Failed to load statistics. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    useEffect(() => {
        if (stats && stats.orderItemRows) {
            (async () => {
                const rowsWithImages = await Promise.all(
                    stats.orderItemRows.map(async (order: any) => {
                        let resolvedImage = order.productImage;
                        if (resolvedImage && !resolvedImage.startsWith('http')) {
                            try {
                                resolvedImage = await getImage(resolvedImage);
                            } catch { }
                        }
                        return { ...order, resolvedImage };
                    })
                );
                setOrderRows(rowsWithImages);
            })();
        }
    }, [stats]);

    const orderColumns: AdaptiveTableColumn<any>[] = [
        {
            key: "productName",
            label: "Product Name",
            render: (_: any, row: any) => (
                <span className="flex items-center gap-2">
                    <img src={row.resolvedImage} alt={row.productName} className="w-7 h-7 rounded object-cover" />
                    <span>{row.productName}</span>
                </span>
            ),
        },
        { key: "orderDate", label: "Order Date", render: (v) => new Date(v).toLocaleString() },
        { key: "price", label: "Price", render: (v) => `$${v}` },
        { key: "quantity", label: "Quantity" },
        {
            key: "paymentStatus",
            label: "Status",
            render: (v) => {
                let color = "gray", bg = "gray-100", text = "gray-500", label = v;
                switch (v) {
                    case "Pending": color = "yellow-500"; bg = "yellow-100"; text = "yellow-600"; label = "Pending"; break;
                    case "Processing": color = "blue-500"; bg = "blue-100"; text = "blue-600"; label = "Processing"; break;
                    case "Shipped": color = "purple-500"; bg = "purple-100"; text = "purple-600"; label = "Shipped"; break;
                    case "Delivered": color = "green-500"; bg = "green-100"; text = "green-600"; label = "Delivered"; break;
                    case "Cancelled": color = "red-500"; bg = "red-100"; text = "red-600"; label = "Cancelled"; break;
                    case "Returned": color = "orange-500"; bg = "orange-100"; text = "orange-600"; label = "Returned"; break;
                }
                return (
                    <span className={`bg-${bg} text-${text} px-3 py-1 rounded text-xs flex items-center gap-1`}>
                        <span className={`w-2 h-2 bg-${color} rounded-full inline-block`}></span>{label}
                    </span>
                );
            },
        },
    ];

    // Chart.js data and options
    const barData = {
        labels: [
            'Total Users',
            'Buyers',
            'Sellers',
            ...(stats && typeof stats.totalAdmins === 'number' ? ['Admins'] : []),
        ],
        datasets: [
            {
                label: 'User Count',
                data: [
                    stats?.totalUsers ?? 0,
                    stats?.totalBuyers ?? 0,
                    stats?.totalSellers ?? 0,
                    ...(stats && typeof stats.totalAdmins === 'number' ? [stats.totalAdmins] : []),
                ],
                backgroundColor: [
                    '#6366f1',
                    '#60a5fa',
                    '#a78bfa',
                    ...(stats && typeof stats.totalAdmins === 'number' ? ['#f59e42'] : []),
                ],
                borderRadius: 8,
            },
        ],
    };
    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6366f1', font: { weight: 600 } } },
            y: { grid: { color: '#e0e7ff' }, ticks: { color: '#6366f1', font: { weight: 600 } } },
        },
    };

    return (
        <>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
                    <Spinner />
                </div>
            )}
            <Navbar />
            <div className="min-h-screen flex ">
                <AppSidebar />
                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-extrabold mb-8 drop-shadow">Admin Dashboard</h1>
                    <p className="mb-4 ">Welcome to the admin dashboard. Here you can manage users, view statistics, and handle orders.</p>
                    <div className="mb-10 w-full max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
                            <h2 className="text-xl font-semibold mb-4 text-indigo-700">User Distribution</h2>
                            <Bar data={barData} options={barOptions} height={220} width={700} />
                        </div>
                    </div>
                    <div className="mb-16">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100 max-w-4xl mx-auto">
                            <h2 className="text-xl font-semibold mb-6 text-indigo-700">Latest Orders Table</h2>
                            <AdaptiveTable columns={orderColumns} data={orderRows} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}