import { useEffect, useState } from "react";
import { getSellerProfile, editSellerProfile } from "@/features/profile/ProfileServices/profile.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { tokenStorage } from "@/shared";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getCountries } from "@/features/profile/Country/country.service";
import { getTaxes } from "@/features/profile/Tax/tax.service";
import { getCategories } from "@/features/profile/Category/category.service";
import Spinner from "@/components/custom/loader";
import type { SellerProfileResponseDTO, EditSellerRequestDTO } from "@/features/profile/DTOs/profile.interfaces";

export default function SellerProfilePage() {
  const { t } = useTranslation();
  const [seller, setSeller] = useState<SellerProfileResponseDTO | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
  const [taxes, setTaxes] = useState<{ id: number; name: string; RegexPattern: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [countryCode, setCountryCode] = useState<number | "">("");
  const [taxId, setTaxId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [taxNumber, setTaxNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = tokenStorage.get();
        if (!token) return;
        const decoded: any = jwtDecode(token);
        const sellerId = decoded.seller_profile_id;
        const profileResult = await getSellerProfile(sellerId);
        setSeller(profileResult.data || profileResult);
        setTaxId((profileResult.data || profileResult).TaxId || "");
        setCategoryId((profileResult.data || profileResult).CategoryId || "");
        setTaxNumber((profileResult.data || profileResult).TaxNumber || "");
        const countriesResult = await getCountries();
        setCountries(countriesResult.data || countriesResult);
        const taxesResult = await getTaxes();
        setTaxes(taxesResult);
        const categoriesResult = await getCategories();
        setCategories(categoriesResult);
      } catch (error) {
        toast.error("Failed to load seller profile");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!seller) return;
    setLoading(true);
    const payload: EditSellerRequestDTO = {
      Name: seller.Name,
      Surname: seller.Surname,
      Email: seller.Email,
      Phone: seller.Phone,
      CountryCitizenshipId: countryCode || seller.CountryCitizenshipId,
      TaxId: taxId || seller.TaxId,
      CategoryId: categoryId || seller.CategoryId,
      TaxNumber: taxNumber || seller.TaxNumber,
      // ...add other fields as needed
    };
    try {
      const result = await editSellerProfile(seller.id, payload);
      if (result && result.isSuccess) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        setSeller({ ...seller, ...payload });
      } else {
        toast.error(result.message || "Profile update failed.");
      }
    } catch (error) {
      toast.error("Profile update failed.");
    }
    setLoading(false);
  };

  const handleCrop = async (croppedImageUrl: string) => {
    // ...implement image cropping logic as in your buyer profile
    setCropperOpen(false);
    toast.success("Cropped image ready to save. Click Save to upload.");
  };

  return (
    <>
      {loading && <Spinner />}
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Seller Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {!seller ? (
                <div>Loading profile...</div>
              ) : (
                <>
                  {/* Profile fields, similar to your buyer profile */}
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    {/* Personal Info */}
                    <div className="flex-1 min-w-[220px] order-1 md:order-none">
                      <h3 className="text-lg font-semibold mb-3 border-b pb-1">Personal Info</h3>
                      <div className="mb-3">
                        <Label>Name</Label>
                        <Input
                          value={seller.Name}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, Name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Surname</Label>
                        <Input
                          value={seller.Surname}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, Surname: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Email <span className={seller.EmailConfirmed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{seller.EmailConfirmed ? "Email Confirmed" : "Email Not Confirmed"}</span></Label>
                        <Input
                          value={seller.Email}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, Email: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Phone</Label>
                        <Input
                          value={seller.Phone}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, Phone: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Country Citizen</Label>
                        <div className="flex items-center gap-2">
                          <span>
                            {/* You can use a flag component here if available */}
                            {countries.find((c) => c.id === seller.CountryCitizenshipId)?.code && (
                              <img src={`https://flagsapi.com/${countries.find((c) => c.id === seller.CountryCitizenshipId)?.code}/flat/24.png`} alt="flag" />
                            )}
                          </span>
                          <span className="ml-1 text-sm">{
                            countries.find((c) => c.id === seller.CountryCitizenshipId)?.name || seller.CountryCitizenshipId
                          }</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label>ID/Passport</Label>
                        <Input
                          value={seller.IdPassport || ""}
                          disabled
                        />
                      </div>
                    </div>
                    {/* Shop Info */}
                    <div className="flex-1 min-w-[220px] order-2 md:order-none">
                      <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Info</h3>
                      <div className="mb-3">
                        <Label>Shop Name</Label>
                        <Input
                          value={seller.StoreName}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, StoreName: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Store Contact Phone</Label>
                        <Input
                          value={seller.StoreContactPhone}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, StoreContactPhone: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Store Contact Email</Label>
                        <Input
                          value={seller.StoreContactEmail}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, StoreContactEmail: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Store Description</Label>
                        <Input
                          value={seller.StoreDescription}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, StoreDescription: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Street</Label>
                        <Input
                          value={seller.Street}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, Street: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>City</Label>
                        <Input
                          value={seller.City}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, City: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>State</Label>
                        <Input
                          value={seller.State}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, State: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Postal Code</Label>
                        <Input
                          value={seller.PostalCode}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, PostalCode: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Address Country</Label>
                        <div className="flex items-center gap-2">
                          <span>
                            {countries.find((c) => c.id === seller.StoreCountryCodeId)?.code && (
                              <img src={`https://flagsapi.com/${countries.find((c) => c.id === seller.StoreCountryCodeId)?.code}/flat/24.png`} alt="flag" />
                            )}
                          </span>
                          <span className="ml-1 text-sm">{
                            countries.find((c) => c.id === seller.StoreCountryCodeId)?.name || seller.StoreCountryCodeId
                          }</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label>Tax ID Type</Label>
                        <select
                          value={taxId || seller.TaxId}
                          onChange={e => setTaxId(Number(e.target.value))}
                          disabled={!editMode}
                        >
                          <option value="">{t("Select tax type")}</option>
                          {taxes.map((tax) => (
                            <option key={tax.id} value={tax.id}>{tax.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <Label>Seller Tax Info ID</Label>
                        <Input
                          value={seller.TaxNumber}
                          disabled={!editMode}
                          onChange={e => setSeller({ ...seller, TaxNumber: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <Label>Category</Label>
                        <select
                          value={categoryId || seller.CategoryId || ""}
                          onChange={e => setCategoryId(e.target.value)}
                          disabled={!editMode}
                        >
                          <option value="">{t("Select category")}</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <Label>Is Verified</Label>
                        <span className={seller.IsVerified ? "text-green-600" : "text-red-600"}>
                          {seller.IsVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    {editMode ? (
                      <>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>Save</Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setEditMode(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </>
  );
}
