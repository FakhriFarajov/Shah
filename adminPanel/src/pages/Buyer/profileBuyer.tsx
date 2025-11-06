import { useEffect, useState } from "react";
import { getBuyerProfile, editBuyerProfile } from "@/features/profile/BuyerService/buyer.service";
import { getBuyerAddress, addAddress, editAddress } from "@/features/profile/addressService/address.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractApiErrors } from "@/shared/utils/errorExtract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/custom/Navbar/navbar";
import ImageCropper from "@/components/ui/image-crop"; // Import the ImageCropper component
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MdAccountCircle } from "react-icons/md";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { uploadProfileImage, getProfileImage } from "@/shared/utils/imagePost";
import { forgotPassword } from "@/features/account/services/register.service";
import { getCountries } from "@/features/profile/Country/country.service";
import Spinner from "@/components/custom/Spinner";
import { apiCallWithManualRefresh } from '@/shared/apiWithManualRefresh';
import { AppSidebar } from "@/components/custom/sidebar";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const buyerIdFromUrl = searchParams.get("buyerId");
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
  const [activePage] = useState<"profileAddresses" | "history" | "notifications" | "reviews" | "faq">("profileAddresses");
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
  const navigator = useNavigate();

  async function fetchCountries() {
    setLoading(true);
    try {
      const countriesResult = await apiCallWithManualRefresh(() => getCountries());
      setCountries(countriesResult);
      console.log("Fetched countries:", countriesResult);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCountries();

    async function fetchBuyerAndAddress() {
      setLoading(true);
      try {
        const result = await apiCallWithManualRefresh(() => getBuyerProfile(buyerIdFromUrl));
        console.log("Profile response:", result);
        const buyerData = result;
        setBuyer(buyerData);
        // Check if email is confirmed
        if (buyerData.isEmailConfirmed === false) {
          toast.info("The buyer's email is not confirmed.");
        }
      } catch (error) {
        console.error("Failed to fetch buyer profile:", error);
        extractApiErrors(error).forEach(msg => toast.error(msg));
      }
      try {
        const addressResult = await apiCallWithManualRefresh(() => getBuyerAddress(buyerIdFromUrl));
        const addressData = addressResult;
        setAddress(addressData);
        // Support different DTO shapes: countryId or country?.id
        setAddressCountryCode((addressData as any).countryId || (addressData as any).country?.id || "");
      } catch (error) {
        extractApiErrors(error).forEach(msg => toast.error(msg));
      } finally {
        setLoading(false);
      }
    }
    fetchBuyerAndAddress();
  }, [buyerIdFromUrl]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAdding(true);
    try {
      const payload = { ...newAddress, buyerId: buyerIdFromUrl };
      console.log("Add Address payload:", payload);
      const result = await apiCallWithManualRefresh(() => addAddress(payload));
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
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      setLoading(false);
      return;
    }

    try {
      var requestData = { userId: buyer.userId, oldPassword: currentPassword, newPassword: newPassword, confirmNewPassword: confirmPassword };
      if (currentPassword.trim() === "") {
        toast.error("Current password cannot be empty");
        return;
      }
      if (newPassword.trim() === "") {
        toast.error("New password cannot be empty");
        return;
      }
      if (confirmPassword.trim() === "") {
        toast.error("Confirm password cannot be empty");
        return;
      }
      console.log(requestData);
      var result = await apiCallWithManualRefresh(() => forgotPassword(requestData));
      if (result.isSuccess) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
      } else {
        console.log("Password change failed:", result.message);
        toast.error(result.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error("Failed to change password", error);
    }
    finally {
      setLoading(false);
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
    setEditProfileMode(false);
  }

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
      let imageProfileUrl = null;
      if (buyer.ImageFile) {
        objectName = await uploadProfileImage(buyer.ImageFile);
        imageProfileUrl = await getProfileImage(objectName);
        payload.imageProfile = objectName;
      }
      const result = await apiCallWithManualRefresh(() => editBuyerProfile(buyer.id, payload));
      if (!result || !result.isSuccess) {
        toast.error(result.message || 'Profile update failed. Please check your details.');
        console.error("Profile update error:", result);
        setLoading(false);
        return;
      }
      toast.success('Profile updated successfully!');
      if (imageProfileUrl) {
        setBuyer({ ...buyer, ...payload, imageProfile: imageProfileUrl });
      } else {
        setBuyer({ ...buyer, ...payload });
      }
      setEditProfileMode(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.errors && typeof data.errors === 'object') {
          Object.values(data.errors).forEach((msgs: any) => {
            if (Array.isArray(msgs)) msgs.forEach((msg: string) => toast.error(msg));
          });
        }
        if (data.message || data.Message) {
          toast.error(data.message || data.Message);
        }
        if (typeof data === "string") {
          toast.error(data);
        }
      } else {
        toast.error('Profile update failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleCrop = async (croppedImageUrl: string) => {
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], "profile.png", { type: blob.type });
    setBuyer((prev: any) => ({ ...prev, ImageFile: file, ImageUrl: croppedImageUrl }));
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
        <AppSidebar />
        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activePage === "profileAddresses" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <Button onClick={() => navigator(-1)} className="text-sm text-indigo-600 bg-transparent hover:text-indigo-500 hover:bg-indigo-100">← Back</Button>
                      {t('Profile & Addresses')}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        <Label>
                          Email
                          <span className="mt-0 mb-0">
                            {!buyer.isEmailConfirmed && !editProfileMode && (
                              <Button variant="link" className="ml-2 p-0">
                                (Confirm Email)
                              </Button>
                            )}
                          </span>
                        </Label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {!editProfileMode ? (
                            <Input type="email" value={buyer.email} disabled />
                          ) : (
                            <Input type="email" value={buyer.editedEmail ?? buyer.email}
                              onChange={e => setBuyer({ ...buyer, editedEmail: e.target.value })}
                            />
                          )}
                          {/* Show Send Confirmation Link button if email is not confirmed */}

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
                          <div className="flex items-center gap-2">
                            {(() => {
                              const selectedCountry = countries.find(c => c.id === (countryCode || buyer?.countryCitizenshipId));
                              const flagUrl = selectedCountry?.code
                                ? `https://flagsapi.com/${selectedCountry.code}/flat/24.png`
                                : "https://flagsapi.com/UN/flat/24.png";
                              return (
                                <img src={flagUrl} alt={selectedCountry ? `${selectedCountry.name} flag` : "No flag"} />
                              );
                            })()}
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
    </>
  );
}
