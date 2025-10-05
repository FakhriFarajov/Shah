import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card } from "../components/ui/card";
import Navbar from "@/components/custom/Navbar/navbar";

import { AppSidebar as SideBar } from "@/components/custom/sidebar";

// Mock data
const buyer = {
    name: "John Doe",
    email: "john.doe@example.com",
    totalOrders: 12,
    totalSpent: "$1,250.00",
    products: [
        { id: 1, name: "Product A", price: "$100", quantity: 2 },
        { id: 2, name: "Product B", price: "$50", quantity: 5 },
    ],
    addresses: [
        { id: 1, address: "123 Main St, City, Country" },
        { id: 2, address: "456 Side Ave, City, Country" },
    ],
    payments: [
        { id: 1, method: "Credit Card", last4: "1234", status: "Active" },
        { id: 2, method: "PayPal", email: "john.paypal@example.com", status: "Inactive" },
    ],
};

const BuyerStatisticsPage = () => {
    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <SideBar />
                <div className="p-8 space-y-8">
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-2">Buyer Statistics</h2>
                        <div>Name: {buyer.name}</div>
                        <div>Email: {buyer.email}</div>
                        <div>Total Orders: {buyer.totalOrders}</div>
                        <div>Total Spent: {buyer.totalSpent}</div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Products</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {buyer.products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.price}</TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Addresses</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {buyer.addresses.map((addr) => (
                                    <TableRow key={addr.id}>
                                        <TableCell>{addr.address}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-2">Payments</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {buyer.payments.map((pay) => (
                                    <TableRow key={pay.id}>
                                        <TableCell>{pay.method}</TableCell>
                                        <TableCell>
                                            {pay.method === "Credit Card"
                                                ? `**** **** **** ${pay.last4}`
                                                : pay.email}
                                        </TableCell>
                                        <TableCell>{pay.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>

    );
};

export default BuyerStatisticsPage;
