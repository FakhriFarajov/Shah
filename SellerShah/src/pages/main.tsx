import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import type { AdaptiveTableColumn } from "@/components/custom/adaptive-table";
import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getImage } from "@/shared/utils/imagePost";
import { useEffect, useState } from "react";
import { getStats } from "@/features/profile/Stats/stats.service";
import Spinner from "@/components/custom/spinner";
import { toast } from "sonner";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";

type TopCountry = { name: string; percent: number };
type SalesByMonth = { month: string; sales: number; date: string };
type SalesPoint = { date: string; sales: number; productImage?: string; productName?: string };
type DashboardData = {
  orderItemRows: any[];
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  topCountries: TopCountry[];
  salesByMonth?: SalesByMonth[];
};

export default function Main() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    orderItemRows: [],
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    topCountries: [],
    salesByMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesRange, setSalesRange] = useState<'day' | 'month' | 'year'>('month');
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await apiCallWithManualRefresh(() => getStats());
        let data = response.data ?? response;

        // Always resolve productImage for each orderItemRow
        const orderItemRowsWithImages = await Promise.all(
          (data.orderItemRows || []).map(async (order: any) => {
            let resolvedImage = order.productImage;
            if (resolvedImage && !resolvedImage.startsWith('http')) {
              try {
                resolvedImage = await getImage(resolvedImage);
                console.log("Resolved product image for order:", order.orderId, resolvedImage);
              } catch {
                // fallback to original
              }
            }
            return { ...order, resolvedImage };
          })
        );
        data.orderItemRows = orderItemRowsWithImages;
        console.log("Resolved order item images:", data.orderItemRows);

        // Build sales points for the selected range
        let points: SalesPoint[] = [];
        if (salesRange === 'day' && Array.isArray(data.salesPerDay)) {
          // Map product images from orderItemRows by date
          const orderImages = (data.orderItemRows || []).reduce((acc: Record<string, { img: string, name: string }>, row: any) => {
            const date = row.orderDate ? row.orderDate.slice(0, 10) : null;
            if (date) {
              acc[date] = { img: row.resolvedImage || row.productImage, name: row.productName };
            }
            return acc;
          }, {});
          points = data.salesPerDay.map((item: any) => {
            const date = item.date.slice(0, 10);
            const imgData = orderImages[date];
            return {
              date: item.date,
              sales: item.sales,
              productImage: imgData ? imgData.img : undefined,
              productName: imgData ? imgData.name : undefined
            };
          });
        } else if (salesRange === 'month' && Array.isArray(data.salesPerMonth)) {
          points = data.salesPerMonth.map((item: any) => ({
            date: `${item.year}-${String(item.month).padStart(2, '0')}-01`,
            sales: item.sales
          }));
        } else if (salesRange === 'year' && Array.isArray(data.salesPerYear)) {
          points = data.salesPerYear.map((item: any) => ({
            date: `${item.year}-01-01`,
            sales: item.sales
          }));
        }
        setSalesPoints(points);
        setDashboard(data);
        setError(null);
      } catch (e: any) {
        if(e.status === 401) {
          toast.info("You have to login to access the dashboard.");
          window.location.href = "/login";
        } else {
          toast.error("Failed to load dashboard data. Please try again later.");
        }
      }
      setLoading(false);
    })();
  }, [salesRange]);

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
    { key: "orderDate", label: "Order Date" },
    { key: "price", label: "Price", render: (v) => `$${v}` },
    {
      key: "quantity",
      label: "Quantity",
      render: (_: any, row: any) => row.quantity,
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v) => {
        // Map status to color and label
        let color = "gray", bg = "gray-100", text = "gray-500", label = v;
        switch (v) {
          case "Pending":
            color = "yellow-500"; bg = "yellow-100"; text = "yellow-600"; label = "Pending"; break;
          case "Processing":
            color = "blue-500"; bg = "blue-100"; text = "blue-600"; label = "Processing"; break;
          case "Shipped":
            color = "purple-500"; bg = "purple-100"; text = "purple-600"; label = "Shipped"; break;
          case "Delivered":
            color = "green-500"; bg = "green-100"; text = "green-600"; label = "Delivered"; break;
          case "Cancelled":
            color = "red-500"; bg = "red-100"; text = "red-600"; label = "Cancelled"; break;
          case "Returned":
            color = "orange-500"; bg = "orange-100"; text = "orange-600"; label = "Returned"; break;
        }
        return (
          <span className={`bg-${bg} text-${text} px-3 py-1 rounded text-xs flex items-center gap-1`}>
            <span className={`w-2 h-2 bg-${color} rounded-full inline-block`}></span>{label}
          </span>
        );
      },
    },
  ];

  const topCountries: TopCountry[] = dashboard.topCountries;
  const salesByMonth: SalesByMonth[] = dashboard.salesByMonth || [];

  // Filter sales data based on selected range
  const now = new Date();
  let filteredSales: SalesByMonth[] = salesByMonth;
  if (salesRange === 'day') {
    filteredSales = salesByMonth.filter(item => {
      const d = new Date(item.date);
      return d.toDateString() === now.toDateString();
    });
  } else if (salesRange === 'month') {
    filteredSales = salesByMonth.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (salesRange === 'year') {
    filteredSales = salesByMonth.filter(item => {
      const d = new Date(item.date);
      return d.getFullYear() === now.getFullYear();
    });
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
          <Spinner />
        </div>
      )}
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6 text-indigo-800">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{dashboard.totalProducts}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">{dashboard.totalOrders}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">${dashboard.totalEarnings}</span>
              </CardContent>
            </Card>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">Recent OrderItems</h2>
            <AdaptiveTable columns={orderColumns} data={dashboard.orderItemRows} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2 bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-700">Sales Over Time</h2>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={salesRange}
                  onChange={e => setSalesRange(e.target.value as 'day' | 'month' | 'year')}
                >
                  <option value="day">Last 1 Day</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    dataKey="date"
                    name="Date"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return salesRange === 'year' ? `${d.getMonth() + 1}/${d.getFullYear()}` : `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis dataKey="sales" name="Sales" />
                  <Tooltip
                    labelFormatter={v => new Date(v).toLocaleDateString()}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded shadow border min-w-[180px]">
                            <div className="font-semibold mb-1">{new Date(data.date).toLocaleDateString()}</div>
                            {data.productImage && (
                              <img src={data.productImage} alt={data.productName || ''} className="w-12 h-12 object-cover rounded mb-1" />
                            )}
                            {data.productName && <div className="text-sm mb-1">{data.productName}</div>}
                            <div className="text-indigo-700 font-bold">Sales: {data.sales}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Sales" data={salesPoints} fill="#4F46E5" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {topCountries.map(c => (
                      <div key={c.name} className="flex items-center justify-between">
                        <span>{c.name}</span>
                        <span className="text-gray-500">{c.percent}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}