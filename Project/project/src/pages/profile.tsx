import { useEffect, useState } from "react";
import { getBuyerProfile } from "@/features/profile/ProfileServices/profile.service";
import { getBuyerAddress, addAddress, editAddress } from "@/features/profile/addressService/address.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCircleQuestion } from "react-icons/fa6";
import { extractApiErrors } from "@/shared/utils/errorExtract";
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
import { tokenStorage } from "@/shared";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { editBuyerProfile } from "@/features/profile/ProfileServices/profile.service";
import { uploadProfileImage, getProfileImage } from "@/shared/utils/imagePost";
import { forgotPassword } from "@/features/account/services/register.service";
import { faqs } from "@/static_data/faq"; //Import FAQ data
import { getCountries } from "@/features/profile/Country/country.service";
import { useNavigate } from "react-router-dom";
import Spinner from "@/components/custom/loader";




const reviews = [
  { id: "1", comment: "Great product!", rating: 5, seller: { id: "s1", name: "Seller 1" } },
  { id: "2", comment: "Not bad", rating: 3, seller: { id: "s2", name: "Seller 2" } },
  { id: "3", comment: "Terrible experience", rating: 1, seller: { id: "s3", name: "Seller 3" } },
];

export default function AccountPage() {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReview, setEditedReview] = useState<{ comment: string; rating: number }>({ comment: '', rating: 5 });
  const [countryCode, setCountryCode] = useState<number | "">("");
  const [addressCountryCode, setAddressCountryCode] = useState<number | "">("");
  const { t } = useTranslation();
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editAddressMode, setEditAddressMode] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false); // State to control cropper dialog
  const [buyer, setBuyer] = useState<any>(null);
  const [address, setAddress] = useState<any>({
    buyerId: '',
    addressId: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    countryCitizenshipId: 1
  });
  const [newAddress, setNewAddress] = useState({
    buyerId: '',
    addressId: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    countryId: 1
  });
  const [adding, setAdding] = useState(false);
  const [errorMessages] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<"profileAddresses" | "history" | "notifications" | "reviews" | "faq">("profileAddresses");
  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [addressAddingMode, setAddressAddingMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(false);

  var navigator = useNavigate();

  async function fetchCountries() {
    setLoading(true);
    try {
      const countries = await getCountries();
      setCountries(countries.data);
      console.log("Fetched countries:", countries.data);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCountries();
    const token = tokenStorage.get();
    console.log("Token:", token); // Debug log to check the token value
    if (!token) return;
    let buyerId = "";
    try {
      const decoded: any = jwtDecode(token);
      buyerId = decoded.buyer_profile_id;
      console.log("Decoded token:", decoded); // Debug log to check the decoded token
      console.log("Decoded buyerId:", buyerId); // Debug log to check the decoded buyerId
    } catch {
      toast.error("Invalid token");
      return;
    }
    if (!buyerId) {
      toast.error("Buyer ID not found in token");
      return;
    };

    async function fetchBuyerAndAddress() {
      setLoading(true);
      try {
        console.log("Fetching profile for ID:", buyerId);
        const result = await getBuyerProfile(buyerId);
        console.log("Profile response:", result);
        const buyerData = result.data ? result.data : result;
        setBuyer(buyerData);
        // Check if email is confirmed
        if (buyerData.emailConfirmed === false || buyerData.emailConfirmed === 0) {
          toast.warning("Your email is not confirmed. Please check your inbox.");
        }
      } catch (error) {
        extractApiErrors(error).forEach(msg => toast.error(msg));
        navigator('/main');
      }
      try {
        const addressResult = await getBuyerAddress(buyerId);
        const addressData = addressResult.data ? addressResult.data : addressResult;
        setAddress(addressData);
        setAddressCountryCode(addressData.countryId || "");
      } catch (error) {
        extractApiErrors(error).forEach(msg => toast.error(msg));
      } finally {
        setLoading(false);
      }
    }
    fetchBuyerAndAddress();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAdding(true);
    try {
      const token = tokenStorage.get();
      let buyerId = "";
      if (token) {
        const decoded: any = jwtDecode(token);
        buyerId = decoded.buyer_profile_id;
      }
      const payload = { ...newAddress, buyerId };
      console.log("Add Address payload:", payload);
      const result = await addAddress(payload);
      if (result && result.isSuccess) {
        setAddress(payload);
        setAdding(false);
        toast.success("Address added successfully");
      } else {
        setAdding(false);
      }
    } catch (error) {
      setAdding(false);
    }
    finally { setLoading(false); }
  };

  const handleSaveAddress = async () => {
    setLoading(true);
    if (!address) return;
    // Compare current address with original (before edit)
    const original = address.original || {};
    const hasChanges =
      address.street !== original.street ||
      address.city !== original.city ||
      address.state !== original.state ||
      address.postalCode !== original.postalCode ||
      address.countryId !== original.countryId;
    if (!hasChanges) {
      toast.info("No changes to save.");
      setEditAddressMode(false);
      return;
    }
    const payload: any = {
      addressId: address.id,
      buyerId: buyer.id,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      countryId: addressCountryCode || address.countryId,
    };

    
    console.log("Edit Address payload:", payload);
    await editAddress(payload)
      .then(() => {
        toast.success("Address updated successfully");
        setEditAddressMode(false);
      })
      .catch((error) => {
        extractApiErrors(error).forEach((msg) => toast.error(msg));
        setEditAddressMode(true);
        toast.error("Failed to update address");
      });
    setLoading(false);
  };


  const handleChangePassword = async () => {
    setLoading(true);
    if (newPassword !== confirmPassword)
      return toast.error("New password and confirmation do not match");
    try {
      var requestData = { userId: buyer.userId, oldPassword: currentPassword, newPassword: newPassword, confirmNewPassword: confirmPassword };
      console.log(requestData);
      var result = await forgotPassword(requestData);
      if (result.isSuccess) {
        toast.success("Password changed successfully");
      }
      else {
        toast.error(result.message || "Failed to change password");
      }
    }
    catch (error) {
      toast.error("Failed to change password", error);
    }
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditProfileMode(false);
    setLoading(false);
  }

  if(tokenStorage.get() === null) {
    toast.error("You must be logged in to view this page.");
    navigator('/main');
  }
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

  // History mock data
  const history = [
    { id: "h1", action: "Profile updated", date: "2025-09-01" },
    { id: "h2", action: "Password changed", date: "2025-08-25" },
    { id: "h3", action: "Address added", date: "2025-08-20" },
  ];
  // Order status filter for history page
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  // Save handler for profile and addresses
  const handleSaveProfile = async () => {
    setLoading(true);
    if (!buyer) return;
    const payload: any = {
      name: buyer.editedName ?? buyer.name,
      surname: buyer.editedSurname ?? buyer.surname,
      email: buyer.editedEmail ?? buyer.email,
      phone: buyer.editedPhone ?? buyer.phone,
      countryCitizenshipId: countryCode || buyer.countryCitizenshipId,
    };
    try {
      let objectName = null;
      let imageUrl = null;
      if (buyer.ImageFile) {
        objectName = await uploadProfileImage(buyer.ImageFile);
        // Save objectName to DB
        imageUrl = await getProfileImage(objectName);
        payload.imageProfile = objectName;
        localStorage.setItem("profileImage", imageUrl);
      } else if (buyer.imageProfile) {
        payload.imageProfile = buyer.imageProfile;
      }
      const result = await editBuyerProfile(buyer.id, payload);
      if (result && result.isSuccess) {
        toast.success("Profile updated successfully");
        setEditProfileMode(false);
        // If a new image was uploaded, display the new image URL
        if (imageUrl) {
          setBuyer({ ...buyer, ...payload, imageProfile: imageUrl });
        } else {
          setBuyer({ ...buyer, ...payload });
        }
      } else {
        extractApiErrors(result).forEach(msg => toast.error(msg));
      }
    } catch (error) {
      extractApiErrors(error).forEach(msg => toast.error(msg));
    }
    setLoading(false);
  };

  const handleCrop = async (croppedImageUrl: string) => {
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], "profile.png", { type: blob.type });
    setBuyer(prev => ({ ...prev, ImageFile: file, ImageUrl: croppedImageUrl }));
    setCropperOpen(false);
    toast.success("Cropped image ready to save. Click Save to upload.");
  };


  return (
    <>
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      )}
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
            <Button
              variant={activePage === "faq" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActivePage("faq")}
            >
              <FaCircleQuestion className="mr-2" /> FAQ
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
                {/* Null check for buyer */}
                {!buyer ? (
                  <div className="text-center py-8 text-gray-500">Loading profile...</div>
                ) : (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      {editProfileMode ? (
                        buyer.ImageUrl ? (
                          <img
                            src={buyer.ImageUrl}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full border mb-2"
                            onClick={() => setCropperOpen(true)}
                            style={{ cursor: 'pointer' }}
                          />
                        ) :
                          buyer.imageProfile ? (
                            <img
                              src={buyer.imageProfile}
                              alt="Avatar"
                              className="w-24 h-24 rounded-full border mb-2"
                              onClick={() => setCropperOpen(true)}
                              style={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <span
                              className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                              style={{ fontSize: '96px', cursor: 'pointer' }}
                              onClick={() => setCropperOpen(true)}
                            >
                              <MdAccountCircle />
                            </span>
                          )
                      ) : (
                        buyer.imageProfile ? (
                          <img
                            src={buyer.imageProfile}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full border mb-2"
                          />
                        ) : (
                          <span
                            className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                            style={{ fontSize: '96px' }}
                          >
                            <MdAccountCircle />
                          </span>
                        )
                      )}
                      {editProfileMode && (
                        <div className="text-sm text-gray-500 mb-2">
                          <Label>Click {buyer.ImageUrl ? 'image' : 'icon'} to change</Label>
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
                        {!editProfileMode ? (
                          <Input value={buyer.name} disabled />
                        ) : (
                          <div>
                            <Input value={buyer.editedName ?? buyer.name}
                              onChange={e => setBuyer({ ...buyer, editedName: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Surname</Label>
                        {!editProfileMode ? (
                          <Input value={buyer.surname} disabled />
                        ) : (
                          <div>
                            <Input
                              value={buyer.editedSurname ?? buyer.surname ?? (buyer.decodedSurname || "")}
                              onChange={e => setBuyer({ ...buyer, editedSurname: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {!editProfileMode ? (
                            <Input type="email" value={buyer.email} disabled />
                          ) : (
                            <Input type="email" value={buyer.editedEmail ?? buyer.email}
                              onChange={e => setBuyer({ ...buyer, editedEmail: e.target.value })}
                            />
                          )}
                          {/* Show Send Confirmation Link button if email is not confirmed */}
                          {buyer.emailConfirmed === false || buyer.emailConfirmed === 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  // Call your backend endpoint to send confirmation link
                                  // Example: await sendConfirmationLink(buyer.email);
                                  toast.success("Confirmation link sent to your email.");
                                } catch (e) {
                                  toast.error("Failed to send confirmation link.");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Send Confirmation Link
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        {!editProfileMode ? (
                          <Input value={buyer.phone} disabled />
                        ) : (
                          <div>
                            <Input value={buyer.editedPhone ?? buyer.phone}
                              onChange={e => setBuyer({ ...buyer, editedPhone: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Label>Country</Label>
                        {!editProfileMode ? (
                          <Label className="text-lg">
                            <div className="flex flex-cols items-center gap-2">
                              {(() => {
                                const country = countries.find(c => c.id === buyer.countryCitizenshipId);
                                const flagUrl = country?.code
                                  ? `https://flagsapi.com/${country.code}/flat/24.png`
                                  : "https://flagsapi.com/UN/flat/24.png";
                                return country ? (
                                  <>
                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                    {country.name}
                                  </>
                                ) : null;
                              })()}
                            </div>
                          </Label>
                        ) : (
                          <div>
                            <select
                                value={countryCode || buyer?.countryCitizenshipId}
                                onChange={e => {
                                  const val = Number(e.target.value);
                                  setCountryCode(val);
                                }}
                              required
                              className="border rounded px-2 py-1"
                            >
                              <option value="">{t("Select country")}</option>
                              {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                  {country.code && (
                                    <img
                                      src={`https://flagsapi.com/${country.code}/flat/24.png`}
                                      alt={`${country.name} flag`}
                                      style={{ width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '4px' }}
                                    />
                                  )}
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  {editProfileMode ? (
                    <>
                      <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                        Change Password
                      </Button>
                      <Button variant="outline" onClick={() => setEditProfileMode(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>Save</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setEditProfileMode(true)}>
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  Created: {buyer && buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : "-"}
                </div>
                {/* Addresses Section */}
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">Address</h3>
                </div>
                <div className="space-y-4">
                  {!address || !address.street ? (
                    addressAddingMode ? (
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <Label>Street</Label>
                          <Input
                            type="text"
                            placeholder="Enter street"
                            value={newAddress.street}
                            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>City</Label>
                          <Input
                            type="text"
                            placeholder="Enter city"
                            value={newAddress.city}
                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>State</Label>
                          <Input
                            type="text"
                            placeholder="Enter state"
                            value={newAddress.state}
                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Postal Code</Label>
                          <Input
                            type="text"
                            placeholder="Enter postal code"
                            value={newAddress.postalCode}
                            onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                      <div className="col-span-2">
                        <Label>Country</Label>
                          <Label className="text-lg">
                            <div className="flex flex-cols items-center gap-2">
                              {(() => {
                                const country = countries.find(c => c.id === addressCountryCode);
                                const flagUrl = country?.code
                                  ? `https://flagsapi.com/${country.code}/flat/24.png`
                                  : "https://flagsapi.com/UN/flat/24.png";
                                return country ? (
                                  <>
                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                    {country.name}
                                  </>
                                ) : null;
                              })()}
                            </div>
                          </Label>
                          <div>
                            <select
                              value={addressCountryCode}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAddressCountryCode(val);
                                setNewAddress({ ...newAddress, countryId: val });
                              }}
                              required
                              className="border rounded px-2 py-1"
                            >
                              <option value="">{t("Select country")}</option>
                              {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>
                      </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setNewAddress({ buyerId: '', addressId: '', street: '', city: '', state: '', postalCode: '', countryId: 1 })}
                          >
                            Clear
                          </Button>
                          <Button type="submit" disabled={adding}>
                            {adding ? "Adding..." : "Add Address"}
                          </Button>
                        </div>
                        {errorMessages.length > 0 && (
                          <div className="text-red-600 mt-2">
                            {errorMessages.map((msg, idx) => <div key={idx}>{msg}</div>)}
                          </div>
                        )}
                      </form>
                    ) : (
                      <Button variant="outline" onClick={() => setAddressAddingMode(true)}>
                        Add Address
                      </Button>
                    )
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Street</Label>
                        {!editAddressMode ? (
                          <Input value={address.street} disabled />
                        ) : (
                          <Input value={address.street}
                            onChange={e => setAddress({ ...address, street: e.target.value })}
                          />
                        )}
                      </div>
                      <div>
                        <Label>City</Label>
                        {!editAddressMode ? (
                          <Input value={address.city} disabled />
                        ) : (
                          <Input value={address.city}
                            onChange={e => setAddress({ ...address, city: e.target.value })}
                          />
                        )}
                      </div>
                      <div>
                        <Label>State</Label>
                        {!editAddressMode ? (
                          <Input value={address.state} disabled />
                        ) : (
                          <Input value={address.state}
                            onChange={e => setAddress({ ...address, state: e.target.value })}
                          />
                        )}
                      </div>
                      <div>
                        <Label>Postal Code</Label>
                        {!editAddressMode ? (
                          <Input value={address.postalCode} disabled />
                        ) : (
                          <Input value={address.postalCode}
                            onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        <Label>Country</Label>
                        {!editAddressMode ? (
                          <div>
                            <Label className="text-lg">
                              {(() => {
                                // Use address.country if present, else address.countryId
                                const countryId = address.country ?? address.countryId;
                                const country = countries.find(c => c.id === countryId);
                                const flagUrl = country?.code
                                  ? `https://flagsapi.com/${country.code}/flat/24.png`
                                  : "https://flagsapi.com/UN/flat/24.png";
                                return country ? (
                                  <div className="flex flex-cols items-center gap-2">
                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                    {country.name}
                                  </div>
                                ) : null;
                              })()}
                            </Label>
                          </div>
                        ) : (
                          <div>
                            <select
                              value={addressCountryCode || address.countryId}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAddressCountryCode(val);
                                setAddress({ ...address, countryId: val });
                              }}
                              required
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value="">{t("Select country")}</option>
                              {countries.map((country) => (
                                <option key={country.id} value={country.id}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 col-span-2">
                        {address && address.street && editAddressMode ? (
                          <>
                            <Button variant="outline" onClick={() => setEditAddressMode(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveAddress}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          address && address.street && (
                            <Button variant="outline" onClick={() => setEditAddressMode(true)}>
                              Edit Address
                            </Button>
                          )
                        )}
                      </div>
                    </div>
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
                <CardTitle>Name's Reviews</CardTitle>// Replace Name with actual buyer's name if available
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {reviews.map((r: any) => (
                    <li key={r.id} className="border-b pb-4 flex gap-4 items-center">
                      <img src={r.product.image} alt={r.product.name} className="w-20 h-20 object-cover rounded border" />
                      <div className="flex-1">
                        <div className="font-semibold">
                          Product: <a href={`/products/${r.product.id}`} className="text-blue-600 underline">{r.product.name}</a>
                          {" "}| Seller: <a href={`/sellers/${r.seller.id}`} className="text-blue-600 underline">{r.seller.name}</a>
                        </div>
                        {editingReviewId === r.id ? (
                          <div className="mt-2">
                            <Label>Edit Comment</Label>
                            <Input
                              value={editedReview.comment}
                              onChange={e => setEditedReview({ ...editedReview, comment: e.target.value })}
                              className="mb-2"
                            />
                            <Label>Edit Rating</Label>
                            <select
                              value={editedReview.rating}
                              onChange={e => setEditedReview({ ...editedReview, rating: Number(e.target.value) })}
                              className="mb-2 border rounded px-2 py-1"
                            >
                              {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveReview(r.id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-yellow-500">Rating: {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                            <div className="mt-1 text-gray-700">{r.comment}</div>
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                              setEditingReviewId(r.id);
                              setEditedReview({ comment: r.comment, rating: r.rating });
                            }}>Edit</Button>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{r.Date}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {activePage === "faq" && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b pb-2">
                      <div className="font-semibold">{faq.question}</div>
                      <div className="mt-1 text-gray-700">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modals */}
          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Change Password</h2>
                <div className="mb-3">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={currentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="*********"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      aria-label={showCurrentPassword ? t("Hide password") : t("Show password")}
                    >
                      {showCurrentPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="*********" />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showNewPassword ? t("Hide password") : t("Show password")}
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="*********" />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? t("Hide password") : t("Show password")}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" /></svg>
                      )}
                    </button>
                  </div>

                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                  <Button onClick={handleChangePassword}>Save</Button>
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
