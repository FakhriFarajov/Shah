import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { FaUser, FaHistory, FaRegBell } from "react-icons/fa";
import ImageCropper from "@/components/ui/image-crop"; // Import the ImageCropper component
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MdAccountCircle } from "react-icons/md";
import { FaStar } from "react-icons/fa";

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
  createdAt: "2025-01-01",
  reviews: [
    {
      id: "r1",
      product: {
        id: "p1",
        name: "Laptop",
        image: "https://via.placeholder.com/150",
      },
      seller: {
        id: "s1",
        name: "TechStore",
      },
      rating: 5,
      comment: "Great product, highly recommend!",
      Date: "2025-08-15",
    },
        {
      id: "r1",
      product: {
        id: "p1",
        name: "Laptop",
        image: "https://via.placeholder.com/150",
      },
      seller: {
        id: "s1",
        name: "TechStore",
      },
      rating: 5,
      comment: "Great product, highly recommend!",
      Date: "2025-08-15",
    },    {
      id: "r1",
      product: {
        id: "p1",
        name: "Laptop",
        image: "https://via.placeholder.com/150",
      },
      seller: {
        id: "s1",
        name: "TechStore",
      },
      rating: 5,
      comment: "Great product, highly recommend!",
      Date: "2025-08-15",
    },    {
      id: "r1",
      product: {
        id: "p1",
        name: "Laptop",
        image: "https://via.placeholder.com/150",
      },
      seller: {
        id: "s1",
        name: "TechStore",
      },
      rating: 5,
      comment: "Great product, highly recommend!",
      Date: "2025-08-15",
    }
  ] 
  
};

export default function AccountPage() {
  // Unified edit mode for all fields
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [draftUser, setDraftUser] = useState(initialUser);
  const [cropperOpen, setCropperOpen] = useState(false); // State to control cropper dialog
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null); // State to store cropped image preview


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
  const [activePage, setActivePage] = useState<"profileAddresses" | "history" | "notifications" | "reviews">("profileAddresses");
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
  // Order status filter for history page
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  // Save handler for profile and addresses
  const handleSaveProfile = () => {
    setUser(draftUser);
    setEditMode(false);
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
  // Handle change for profile fields (edit draft)
  const handleChange = (field: string, value: string) => {
    setDraftUser({ ...draftUser, [field]: value });
  };

  // Handle change for address fields (edit draft)
  const handleAddressChange = (
    index: number,
    field: keyof typeof initialUser.addresses[0],
    value: string
  ) => {
    const addresses = [...draftUser.addresses];
    addresses[index] = { ...addresses[index], [field]: value };
    setDraftUser({ ...draftUser, addresses });
  };


  const handleCrop = (croppedImage: string) => {
    setCroppedPreview(croppedImage);
    setDraftUser((prev) => ({ ...prev, avatar: croppedImage }));
    setCropperOpen(false);
  }


  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-4 space-y-4">
          <h2 className="text-xl font-bold mb-4">My Account</h2>
          <nav className="space-y-2">
            <Button
              variant={activePage === "profileAddresses" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("profileAddresses")}
            >
              <FaUser className="mr-2" /> Profile & Addresses
            </Button>
            <Button
              variant={activePage === "history" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("history")}
            >
              <FaHistory className="mr-2" /> Orders History
            </Button>
            <Button
              variant={activePage === "notifications" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("notifications")}
            >
              <FaRegBell className="mr-2" /> Notifications
            </Button>
            <Button
              variant={activePage === "reviews" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("reviews")}
            >
              <FaStar className="mr-2" /> Reviews
            </Button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activePage === "profileAddresses" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile & Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-6">
                  {editMode && draftUser.avatar ? (
                    <img
                      src={draftUser.avatar}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full border mb-2"
                      onClick={() => setCropperOpen(true)}
                      style={{ cursor: 'pointer' }}
                    />
                  ) : (
                    <span
                      className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                      style={{ fontSize: '96px', cursor: editMode ? 'pointer' : 'default' }}
                      onClick={editMode ? () => setCropperOpen(true) : undefined}
                    >
                      <MdAccountCircle />
                    </span>
                  )}
                  {editMode && (
                    <div className="text-sm text-gray-500 mb-2">
                      <Label>Click {draftUser.avatar ? 'image' : 'icon'} to change</Label>
                      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                        <DialogContent className="min-w-2xl w-full">
                          <ImageCropper onCrop={handleCrop} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editMode ? draftUser.name : user.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Surname</Label>
                    <Input
                      value={editMode ? draftUser.surname : user.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editMode ? draftUser.email : user.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editMode ? draftUser.phone : user.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Country</Label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={editMode ? draftUser.country : user.country}
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
                <div className="text-sm text-gray-500 mb-6">Created: 2025-01-01</div>
                {/* Addresses Section */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">Addresses</h3>
                </div>
                <div className="space-y-4">
                  {(editMode ? draftUser.addresses : user.addresses).map((addr, idx) => (
                    <div key={addr.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
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
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-8">
                  {editMode ? (
                    <>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                        Change Password
                      </Button>
                      <Button onClick={handleSaveProfile}>Save</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => { setDraftUser(user); setEditMode(true); }}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {activePage === "history" && (
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor="order-status-filter" className="font-medium">Filter by status:</label>
                    <select
                      id="order-status-filter"
                      className="border rounded px-2 py-1"
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <ul className="divide-y">
                    {orderHistory
                      .filter(order => !orderStatusFilter || order.status === orderStatusFilter)
                      .map((order) => (
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
                                <li key={item.id} className="flex items-center gap-2">
                                  <a
                                    href={`/product/${item.product.id}`}
                                    className="flex items-center gap-2 hover:underline"
                                    style={{ display: 'inline-flex', alignItems: 'center' }}
                                  >
                                    {/* Replace with actual image path or fallback */}
                                    <img
                                      src={item.product.image || <MdAccountCircle />}
                                      alt={item.product.title}
                                      className="w-10 h-10 object-cover rounded mr-2 border"
                                      style={{ minWidth: 40, minHeight: 40 }}
                                    />
                                    <span>{item.product.title}</span>
                                  </a>
                                  <span className="ml-2">x{item.quantity} (${item.product.price})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          {activePage === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {history.map((notif) => (
                    <li key={notif.id} className="py-2 flex justify-between items-center">
                      <span>{notif.action}</span>
                      <span className="text-xs text-gray-500">{notif.date}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {activePage === "reviews" && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>{initialUser.name}'s Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {initialUser.reviews.map(r => (
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
      <Footer />
    </>
  );
}
