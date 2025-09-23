import Navbar from "../components/custom/Navbar/navbar";
import Footer from "../components/custom/footer";
import { AppSidebar } from "@/components/custom/sidebar";
import { useState } from "react";
import { AdaptiveTable } from "@/components/custom/adaptive-table";

// --- Types matching backend ---
type User = { id: string; name: string };
type Address = { id: string; line: string };
type Payment = { id: string; method: string; amount: number };
type Product = { id: string; name: string; images: string[] };
type OrderItem = {
	id: string;
	orderId: string;
	productId: string;
	product: Product;
	quantity: number;
};
type OrderStatus = "Pending" | "InProcess" | "Done";
type Order = {
	id: string;
	userId: string;
	user: User;
	totalAmount: number;
	quantity: number;
	status: OrderStatus;
	createdAt: string;
	shippingAddressId: string;
	shippingAddress: Address;
	orderItems: OrderItem[];
	payment?: Payment;
};

const initialOrders: Order[] = [
	{
		id: "1",
		userId: "u1",
		user: { id: "u1", name: "Eddie Lake" },
		quantity: 5,
		totalAmount: 500,
		status: "InProcess",
		createdAt: "2025-08-29T10:00:00Z",
		shippingAddressId: "addr1",
		shippingAddress: { id: "addr1", line: "123 Main St, Cityville" },
		orderItems: [
			{
				id: "oi1",
				orderId: "1",
				productId: "p1",
				product: { id: "p1", name: "Product A", images: ["https://via.placeholder.com/150"] },
				quantity: 2,
			},
			{
				id: "oi2",
				orderId: "1",
				productId: "p2",
				product: { id: "p2", name: "Product B", images: [] },
				quantity: 3,
			},
		],
		payment: { id: "pay1", method: "Credit Card", amount: 500 },
	},


];

const cargoCompanies = [
	{ id: "cargo1", name: "FedEx" },
	{ id: "cargo2", name: "DHL" },
	{ id: "cargo3", name: "UPS" },
];

export default function OrdersPage() {
	const [sortByDateAsc, setSortByDateAsc] = useState(false);
	const [orders, setOrders] = useState<Order[]>(initialOrders);
	const [showModal, setShowModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [selectedCargo, setSelectedCargo] = useState("");
	const [newStatus, setNewStatus] = useState<OrderStatus>("Pending");
	const [filterStatus, setFilterStatus] = useState<"All" | OrderStatus>("All");

	const handleOrderClick = (order: Order) => {
		setSelectedOrder(order);
		setNewStatus(order.status);
		setSelectedCargo("");
		setShowModal(true);
	};

	// Save status change (not shipping)
	const handleSave = () => {
		if (selectedOrder) {
			setOrders((prev) =>
				prev.map((o) =>
					o.id === selectedOrder.id ? { ...o, status: newStatus } : o
				)
			);
		}
		setShowModal(false);
		setSelectedOrder(null);
		setSelectedCargo("");
	};

	// Ship order (status 'Done' and cargo selected)
	const handleSend = () => {
		if (selectedOrder && selectedCargo) {
			setOrders((prev) =>
				prev.map((o) =>
					o.id === selectedOrder.id
						? { ...o, status: newStatus, cargoCompany: selectedCargo }
						: o
				)
			);
		}
		setShowModal(false);
		setSelectedOrder(null);
		setSelectedCargo("");
	};

	const handleChangeStatus = (status: OrderStatus) => {
		setNewStatus(status);
	};

		let filteredOrders = filterStatus === "All"
			? orders
			: orders.filter((o) => o.status === filterStatus);

		// Sort by date if toggled
		filteredOrders = [...filteredOrders].sort((a, b) => {
			if (!sortByDateAsc) {
				// Descending (newest first)
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			} else {
				// Ascending (oldest first)
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			}
		});

	// AdaptiveTable columns
		const orderColumns = [
		{
			key: "id" as const,
			label: "Order #",
			render: (id: string) => <span className="font-mono">{id}</span>,
		},
		{ key: "user" as const, label: "User", render: (user: User) => user.name },
		{
			key: "product" as any,
			label: "Product",
			render: (_: any, row: Order) => (
				<div className="flex items-center gap-2">
					{row.orderItems[0]?.product.images?.length > 0 ? (
						<img
							src={row.orderItems[0].product.images[0]}
							alt={row.orderItems[0].product.name}
							className="w-10 h-10 object-cover rounded"
						/>
					) : (
						<span className="text-gray-400">No Image</span>
					)}
					<span>{row.orderItems[0]?.product.name}</span>
				</div>
			),
		},
		{
			key: "status" as const,
			label: "Status",
			render: (status: OrderStatus) => (
				<span
					className={`px-2 py-0.5 rounded text-xs ${status === "Done"
							? "bg-green-100 text-green-700"
							: status === "InProcess"
								? "bg-yellow-100 text-yellow-700"
								: "bg-gray-100 text-gray-600"
						}`}
				>
					{status}
				</span>
			),
		},
		{
			key: "quantity" as const,
			label: "Quantity",
			render: (quantity: number) => (
				<span className="font-semibold text-indigo-700">{quantity}</span>
			),
		},
		{
			key: "totalAmount" as const,
			label: "Total",
			render: (v: number) => (
				<span className="font-semibold text-indigo-700">${v}</span>
			),
		},
			{
				key: "createdAt" as const,
				label: (
					<button
						type="button"
						className="flex items-center gap-1 text-xs text-gray-700 font-semibold focus:outline-none"
						onClick={() => setSortByDateAsc((asc) => !asc)}
					>
						Date
						<span className="text-xs">
							{sortByDateAsc ? "▲" : "▼"}
						</span>
					</button>
				),
				render: (date: string) => (
					<span className="text-xs text-gray-500">{date.slice(0, 10)}</span>
				),
			},
		{
			key: "action" as any,
			label: "Action",
			render: (_: any, row: Order) => (
				<button
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl shadow text-sm font-semibold"
					onClick={() => handleOrderClick(row)}
				>
					Manage
				</button>
			),
		},
	];

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-50 flex">
				<AppSidebar />
				<div className="flex-1 py-8 px-2 md:px-8">
					<div className="max-w-6xl mx-auto mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-1">Orders</h1>
						<p className="text-gray-500">View all your orders here.</p>
					</div>

					{/* Status Filter */}
					<div className="max-w-6xl mx-auto mb-4 flex gap-2 items-center">
						<label className="font-medium text-gray-700">Filter:</label>
						<select
							className="border rounded px-3 py-1.5"
							value={filterStatus}
							onChange={(e) =>
								setFilterStatus(e.target.value as "All" | OrderStatus)
							}
						>
							<option value="All">All</option>
							<option value="Pending">Pending</option>
							<option value="InProcess">InProcess</option>
							<option value="Done">Done</option>
						</select>
					</div>

					{/* Orders Table with scroll */}
					<div className="max-w-6xl mx-auto mt-4">
						<div className="overflow-x-auto rounded-lg shadow border bg-white">
							<div className="max-h-[750px] overflow-y-auto">
								<AdaptiveTable columns={orderColumns} data={filteredOrders} />
							</div>
						</div>
					</div>

					{/* Modal for managing order */}
					{showModal && selectedOrder && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
							<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn overflow-y-auto max-h-[90vh]">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl"
									onClick={() => setShowModal(false)}
									aria-label="Close"
								>
									&times;
								</button>
								<h2 className="text-2xl font-bold mb-4 text-indigo-700">
									Manage Order
								</h2>

								{/* Order info */}
								<div className="mb-4 space-y-2">
									<div>
										<b>Order #:</b>{" "}
										<span className="font-mono">{selectedOrder.id}</span>
									</div>
									<div>
										<b>User:</b> {selectedOrder.user.name}
									</div>
									<div>
										<b>Quantity:</b> {selectedOrder.quantity}
									</div>
									<div>
										<b>Date:</b> {selectedOrder.createdAt.slice(0, 10)}
									</div>
									<div>
										<b>Shipping Address:</b> {selectedOrder.shippingAddress.line}
									</div>
									<div>
										<b>Payment:</b>{" "}
										{selectedOrder.payment
											? `${selectedOrder.payment.method} ($${selectedOrder.payment.amount})`
											: "-"}
									</div>
								</div>

								{/* Status Selector */}
								<div className="mb-4">
									<label className="block font-medium mb-1 text-indigo-700">
										Change Status
									</label>
									<select
										className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
										value={newStatus}
										onChange={(e) =>
											setNewStatus(e.target.value as OrderStatus)
										}
									>
										<option value="Pending">Pending</option>
										<option value="InProcess">InProcess</option>
										<option value="Done">Done</option>
									</select>
								</div>

								{newStatus === "Done" ? (
									<>
										<div className="mb-4">
											<label className="block font-medium mb-1 text-indigo-700">
												Select Cargo Company
											</label>
											<select
												className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
												value={selectedCargo}
												onChange={(e) => setSelectedCargo(e.target.value)}
											>
												<option value="">Select...</option>
												{cargoCompanies.map((cargo) => (
													<option key={cargo.id} value={cargo.id}>
														{cargo.name}
													</option>
												))}
											</select>
										</div>
										<button
											className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4 disabled:opacity-60"
											onClick={handleSend}
											disabled={!selectedCargo}
										>
											Ship Order
										</button>
									</>
								) : (
									<button
										className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow mt-4"
										onClick={handleSave}
									>
										Save Changes
									</button>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}
