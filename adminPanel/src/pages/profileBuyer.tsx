"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/custom/Navbar/navbar";
import { FaUser, FaMapMarkerAlt, FaCamera } from "react-icons/fa";

// Mock user data
const initialUser = {
  name: "Fakhri",
  surname: "Farajov",
  email: "fakhri@example.com",
  phone: "+994501234567",
  profilePicture: null as string | null,
  country: "Azerbaijan",
  addresses: [
    {
      id: "a1",
      street: "Nizami Street",
      city: "Baku",
      state: "Absheron",
      postalCode: "AZ1000",
      country: "Azerbaijan",
    },
  ],
};

export default function AccountPage() {
  // Edit mode for profile
  const [editMode, setEditMode] = useState(false);
  // Edit mode for each address
  const [addressEditModes, setAddressEditModes] = useState<{ [id: string]: boolean }>({});

  const handleAddressEditToggle = (id: string) => {
    setAddressEditModes((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  // Order status enum
  type OrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";
  // Mock order history data
  const orderHistory = [
    {
      id: "o1",
      totalAmount: 1200.5,
      status: "Delivered" as OrderStatus,
      createdAt: "2025-08-10",
      shippingAddress: {
        street: "Nizami Street",
        city: "Baku",
        state: "Absheron",
        postalCode: "AZ1000",
        country: "Azerbaijan",
      },
      payment: { method: "Card", paid: true },
      orderItems: [
        {
          id: "oi1",
          product: {
            id: "p1",
            title: "Laptop",
            description: "Gaming Laptop",
            price: 1200.5,
          },
          quantity: 1,
        },
      ],
    },
    {
      id: "o2",
      totalAmount: 50,
      status: "Shipped" as OrderStatus,
      createdAt: "2025-07-22",
      shippingAddress: {
        street: "28 May",
        city: "Baku",
        state: "Absheron",
        postalCode: "AZ1001",
        country: "Azerbaijan",
      },
      payment: { method: "Card", paid: true },
      orderItems: [
        {
          id: "oi2",
          product: {
            id: "p2",
            title: "Headphones",
            description: "Wireless Headphones",
            price: 50,
          },
          quantity: 1,
        },
      ],
    },
    {
      id: "o3",
      totalAmount: 20,
      status: "Cancelled" as OrderStatus,
      createdAt: "2025-07-01",
      shippingAddress: {
        street: "Samed Vurgun",
        city: "Baku",
        state: "Absheron",
        postalCode: "AZ1002",
        country: "Azerbaijan",
      },
      payment: { method: "Card", paid: false },
      orderItems: [
        {
          id: "oi3",
          product: {
            id: "p3",
            title: "Book",
            description: "Novel",
            price: 20,
          },
          quantity: 2,
        },
      ],
    },
  ];
  const [activePage, setActivePage] = useState<"profile" | "addresses" | "history">("profile");
  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // History mock data
  const history = [
    { id: "h1", action: "Profile updated", date: "2025-09-01" },
    { id: "h2", action: "Password changed", date: "2025-08-25" },
    { id: "h3", action: "Address added", date: "2025-08-20" },
  ];
  // Save handler for profile
  const handleSaveProfile = () => {
    alert("Profile saved!");
  };
  // Save handler for password
  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed!");
  };
  const [user, setUser] = useState(initialUser);

  // Profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = URL.createObjectURL(e.target.files[0]);
      setUser({ ...user, profilePicture: file });
    }
  };

  const handleChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleAddressChange = (
    index: number,
    field: keyof typeof initialUser.addresses[0],
    value: string
  ) => {
    const addresses = [...user.addresses];
    addresses[index] = { ...addresses[index], [field]: value };
    setUser({ ...user, addresses });
  };

  const addAddress = () => {
    const newAddress = {
      id: `a${user.addresses.length + 1}`,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    };
    setUser({ ...user, addresses: [...user.addresses, newAddress] });
  };

  return (
    <>
      <Navbar></Navbar>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4 space-y-4">
          <h2 className="text-xl font-bold mb-4">My Account</h2>
          <nav className="space-y-2">
            <Button
              variant={activePage === "profile" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("profile")}
            >
              <FaUser className="mr-2" /> Profile
            </Button>
            <Button
              variant={activePage === "addresses" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("addresses")}
            >
              <FaMapMarkerAlt className="mr-2" /> Addresses
            </Button>
            <Button
              variant={activePage === "history" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("history")}
            >
              <FaUser className="mr-2" /> History
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Profile Page */}
          {activePage === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.profilePicture ?? ""} />
                    <AvatarFallback>{user.name[0]}{user.surname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label
                      htmlFor="profilePic"
                      className="cursor-pointer flex items-center space-x-2 text-blue-600"
                    >
                      <FaCamera /> <span>Change Picture</span>
                    </Label>
                    <Input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                      disabled={!editMode}
                    />
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={user.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Surname</Label>
                    <Input
                      value={user.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={user.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={user.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Country</Label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={user.country ?? "Azerbaijan"}
                      onChange={(e) => handleChange("country", e.target.value)}
                      disabled={!editMode}
                    >
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Russia">Russia</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Created: 2025-01-01</div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditMode((e) => !e)}>
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                  {
                    editMode ? (
                      <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                        Change Password
                      </Button>
                    ) : null
                  }

                  <Button onClick={handleSaveProfile} disabled={!editMode}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses Page */}
          {activePage === "addresses" && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Addresses</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addAddress}>
                    + Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.addresses.map((addr, idx) => {
                  const editMode = addressEditModes[addr.id] || false;
                  return (
                    <div key={addr.id} className="grid grid-cols-2 gap-4 border p-3 rounded shadow-md">
                      {/* ...existing address fields... */}
                      <div className="col-span-2 flex justify-end gap-2 mt-4">
                        <Button size="sm" variant={editMode ? "outline" : "default"} className="rounded-full px-3" onClick={() => handleAddressEditToggle(addr.id)}>
                          {editMode ? "Cancel" : "Edit"}
                        </Button>
                        {editMode && (
                          <Button
                            size="sm"
                            variant="default"
                            className="rounded-full px-3"
                            onClick={() => {
                              // ...existing save logic...
                            }}
                          >
                            Save
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label>Street</Label>
                        <Input
                          value={addr.street}
                          onChange={(e) => handleAddressChange(idx, "street", e.target.value)}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={addr.city}
                          onChange={(e) => handleAddressChange(idx, "city", e.target.value)}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={addr.state}
                          onChange={(e) => handleAddressChange(idx, "state", e.target.value)}
                          disabled={!editMode}
                        />
                      </div>
                      <div>
                        <Label>Postal Code</Label>
                        <Input
                          value={addr.postalCode}
                          onChange={(e) => handleAddressChange(idx, "postalCode", e.target.value)}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Country</Label>
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={addr.country}
                          onChange={(e) => handleAddressChange(idx, "country", e.target.value)}
                          disabled={!editMode}
                        >
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Russia">Russia</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
          {/* History Page */}
          {activePage === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Order History</h3>
                <ul className="divide-y">
                  {orderHistory.map((order) => (
                    <li key={order.id} className="py-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Order #{order.id}</span>
                        <span>{order.createdAt}</span>
                        <span className={`text-xs px-2 py-1 rounded ${order.status === "Delivered" ? "bg-green-200" : order.status === "Cancelled" ? "bg-red-200" : "bg-yellow-200"}`}>{order.status}</span>
                      </div>
                      <div className="ml-2 text-sm text-gray-600">Total: ${order.totalAmount}</div>
                      <div className="ml-2 text-sm text-gray-600">Shipping: {order.shippingAddress.street}, {order.shippingAddress.city}</div>
                      <div className="ml-2 mt-1">
                        <span className="font-semibold">Items:</span>
                        <ul className="ml-4 list-disc">
                          {order.orderItems.map((item) => (
                            <li key={item.id}>
                              {item.product.title} x{item.quantity} (${item.product.price})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Change Password</h2>
                <div className="mb-3">
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                  <Button onClick={handleSavePassword}>Save</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
