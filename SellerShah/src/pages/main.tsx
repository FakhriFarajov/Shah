import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackToTopButton from "@/components/custom/BackToTopButton";
import { AdaptiveTable } from "@/components/custom/adaptive-table";
import type { AdaptiveTableColumn } from "@/components/custom/adaptive-table";
import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";



// --- Order and OrderItem types matching C# models ---
type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  id: string;
  orderDate: string;
  price: number;
  paymentStatus: 'Unpaid' | 'Packed' | 'Completed';
  status: string;
  orderItem: OrderItem;
};

// Example data (replace with real API data as needed)
const initialOrderData: Order[] = [
  {
    id: "#SLR980131-9N",
    orderDate: "13 February, 2025",
    price: 28,
    paymentStatus: "Unpaid",
    status: "Unpaid",
    orderItem: {
      id: "OI-1",
      productId: "P-1",
      productName: "Apple iPad (Gen 10)",
      productImage: "/src/assets/images/man.png",
      quantity: 1,
      unitPrice: 28,
    },
  },
  {
    id: "#SLR980130-8N",
    orderDate: "13 February, 2025",
    price: 32,
    paymentStatus: "Packed",
    status: "Packed",
    orderItem: {
      id: "OI-2",
      productId: "P-2",
      productName: "Apple iPhone 13",
      productImage: "/src/assets/images/ShahLogo1.jpg",
      quantity: 1,
      unitPrice: 32,
    },
  },
  {
    id: "#SLR980129-7N",
    orderDate: "13 February, 2025",
    price: 24,
    paymentStatus: "Packed",
    status: "Packed",
    orderItem: {
      id: "OI-3",
      productId: "P-3",
      productName: "Apple MacBook Air M2",
      productImage: "/src/assets/images/ShahLogo2.png",
      quantity: 1,
      unitPrice: 24,
    },
  },
  {
    id: "#SLR980128-6F",
    orderDate: "13 February, 2025",
    price: 38,
    paymentStatus: "Completed",
    status: "Completed",
    orderItem: {
      id: "OI-4",
      productId: "P-4",
      productName: "Apple iMac 2023",
      productImage: "/src/assets/images/man.png",
      quantity: 1,
      unitPrice: 38,
    },
  },
  {
    id: "#SLR980127-5F",
    orderDate: "13 February, 2025",
    price: 46,
    paymentStatus: "Completed",
    status: "Completed",
    orderItem: {
      id: "OI-5",
      productId: "P-5",
      productName: "Apple Airpods 4",
      productImage: "/src/assets/images/man.png",
      quantity: 1,
      unitPrice: 46,
    },
  },
];

function OrderDetailsModal({ order }: { order: Order }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <div><b>Order ID:</b> {order.id}</div>
        <div><b>Product:</b> {order.orderItem.productName}</div>
        <div><b>Quantity:</b> {order.orderItem.quantity}</div>
        <div><b>Price:</b> ${order.price}</div>
        <div><b>Status:</b> {order.paymentStatus}</div>
        <div><b>Order Date:</b> {order.orderDate}</div>
        <div><b>Product Image:</b><br /><img src={order.orderItem.productImage} alt={order.orderItem.productName} className="w-20 h-20 rounded object-cover mt-1" /></div>
      </div>
    </DialogContent>
  );
}

export default function Main() {
  const { t } = useTranslation();
  const navigator = useNavigate();23
  const [goods, setGoods] = useState<Product[]>([]); // unused, but kept for now
  const [orderData] = useState<Order[]>(initialOrderData);



  const orderColumns: AdaptiveTableColumn<Order>[] = [
    {
      key: "orderItem",
      label: "Product Name",
      render: (item: OrderItem, row: Order) => (
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 hover:underline focus:outline-none">
              <img src={item.productImage} alt={item.productName} className="w-7 h-7 rounded object-cover" />
              <span>{item.productName}</span>
            </button>
          </DialogTrigger>
          <OrderDetailsModal order={row} />
        </Dialog>
      ),
    },
    { key: "orderDate", label: "Order Date" },
    { key: "price", label: "Price", render: (v) => `$${v}` },
    {
      key: "paymentStatus",
      label: "Status",
      render: (v) =>
        v === "Unpaid" ? (
          <span className="bg-red-100 text-red-500 px-3 py-1 rounded text-xs flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>Unpaid</span>
        ) : v === "Packed" ? (
          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded text-xs flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>Packed</span>
        ) : (
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>Completed</span>
        ),
    },
    {
      key: "orderItem",
      label: "Quantity",
      render: (item: OrderItem) => item.quantity,
    },
  ];

  const chartData = [
    { month: "Jan", sales: 120 },
    { month: "Feb", sales: 90 },
    { month: "Mar", sales: 100 },
    { month: "Apr", sales: 130 },
    { month: "May", sales: 110 },
    { month: "Jun", sales: 140 },
    { month: "Jul", sales: 120 },
    { month: "Aug", sales: 150 },
    { month: "Sep", sales: 160 },
    { month: "Oct", sales: 170 },
    { month: "Nov", sales: 180 },
    { month: "Dec", sales: 190 },
  ];
  const earningsData = [
    { name: "Income", value: 20199, color: "#4F46E5" },
    { name: "Taxes", value: 1021, color: "#F59E42" },
    { name: "Fees", value: 992, color: "#F43F5E" },
  ];
  const stats = [
    { label: "Orders", value: 254, change: "+12.5%", color: "text-green-600" },
    { label: "Revenue", value: "$6,260", change: "+7%", color: "text-green-600" },
    { label: "Revenue", value: "$2,567", change: "+0.32%", color: "text-orange-500" },
  ];
  const topCountries = [
    { name: "United States", percent: 80 },
    { name: "Germany", percent: 69 },
    { name: "United Kingdom", percent: 69 },
    { name: "Russia", percent: 35 },
  ];

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


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="px-8 pt-8 pb-2">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Everything here</p>
          </div>
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-8 px-8 pb-8">
            <div className="xl:col-span-2 flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#4F46E5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdaptiveTable columns={orderColumns} data={orderData} />
                  <div className="mt-2 text-indigo-600 text-sm cursor-pointer">View Full Orders &gt;</div>
                </CardContent>
              </Card>
            </div>
            {/* Right: Earnings, Stats, Top Countries */}
            <div className="flex flex-col gap-8">
              {/* Earnings Donut */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings</CardTitle>
                </CardHeader>
                <CardContent>
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
                    <div className="text-2xl font-bold mt-2">$12,560 <span className="text-gray-400 text-base">Balance</span></div>
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
                </CardContent>
              </Card>
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {stats.map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <div>{s.label}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{s.value}</span>
                          <span className={s.color}>{s.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Top Countries */}
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
      {/* Back to Top Button */}
      <BackToTopButton />
      <Footer />
    </>
  );
}