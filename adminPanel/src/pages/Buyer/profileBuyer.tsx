import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/custom/Navbar/navbar";
import { useNavigate } from "react-router-dom";
import { AppSidebar as Sidebar } from "@/components/custom/sidebar";
import ImageCropper from '@/components/ui/image-crop';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Mock buyer data (replace with real data/fetch in production)
const initialBuyer = {
  avatar: "/src/assets/images/ShahLogo2.png", // Example image path
  name: "Fakhri",
  surname: "Farajov",
  email: "fakhri@example.com",
  phone: "+994501234567",
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

export default function profileBuyer() {
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState(initialBuyer);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [avatar, setAvatar] = useState(buyer.avatar);

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    // Implement actual password change logic here (e.g., API call)
    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }
  const handleChange = (field: string, value: string) => {
    setBuyer({ ...buyer, [field]: value });
  };

  const handleCrop = (croppedUrl: string) => {
    setAvatar(croppedUrl);
    setBuyer(prev => ({ ...prev, avatar: croppedUrl }));
    setCropperOpen(false);
  };

  const changePasswordModal = () => {
    // Open change password modal
  };

  const handleAddressChange = (
    index: number,
    field: keyof typeof initialBuyer.addresses[0],
    value: string
  ) => {
    const addresses = [...buyer.addresses];
    addresses[index] = { ...addresses[index], [field]: value };
    setBuyer({ ...buyer, addresses });
  };



  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar></Sidebar>
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <Button variant="outline" className="m-4 w-[70px]" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <CardHeader>
              <CardTitle>Edit and Check Buyer Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-2 max-w-5xl mx-auto w-full">
              <div className="gap-4 mb-6">
                <div className="flex flex-col items-center m-4">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border mb-2 cursor-pointer"
                    onClick={editMode ? () => setCropperOpen(true) : undefined}
                  />
                  {editMode && (
                    <div className="text-sm text-gray-500 mb-2">Click image to change
                      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                        <DialogContent className="min-w-2xl w-full">
                          <ImageCropper
                            onCrop={handleCrop}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={buyer.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Surname</Label>
                    <Input
                      value={buyer.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={buyer.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={buyer.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Country</Label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={buyer.country}
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
              </div>

              {/* Addresses Section */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold">Addresses</h3>
              </div>
              <div className="space-y-4">
                {buyer.addresses.map((addr, idx) => {
                  return (
                    <div key={addr.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded">
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
              </div>
              <div className="flex justify-start gap-2 mt-8">
                <Button onClick={() => setEditMode((e) => !e)}>
                  {editMode ? "Save" : "Edit Profile"}
                </Button>
                {editMode && (
                  <div>
                    <Button onClick={changePasswordModal} variant="outline" className="mr-2">
                      Change Password
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>

                )}

              </div>
            </CardContent>
          </Card>
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
