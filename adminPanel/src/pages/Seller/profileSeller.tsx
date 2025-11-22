import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "@/components/custom/Navbar/navbar";
import ImageCropper from "@/components/ui/image-crop";
import { MdAccountCircle } from "react-icons/md";
import { getCountries } from "@/features/profile/Country/country.service";
import { getCategories } from "@/features/profile/Category/category.service";
import Spinner from "@/components/custom/Spinner";
import { getSellerProfile, editSellerProfile } from "@/features/profile/SellerService/seller.service";
import { tokenStorage } from "@/shared";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { uploadImage, getImage } from "@/shared/utils/imagePost";
import { AppSidebar } from "@/components/custom/sidebar";
import { useSearchParams } from "react-router-dom";
import { Switch } from "@/components/ui/switch";


export default function ProfileSeller() {
    const [searchParams] = useSearchParams();
    const sellerIdFromUrl: any = searchParams.get("sellerId");
    const [editedTaxId, setEditedTaxId] = useState<number | "">("");
    const [taxes, setTaxes] = useState<{ id: number; name: string; RegexPattern: string }[]>([]);
    const [editedTaxNumber, setEditedTaxNumber] = useState<string>("");
    const [editedCategoryId, setEditedCategoryId] = useState<string>("");
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string; parentCategoryId: string | null }>>([]);
    const [seller, setSeller] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);

    const [countryCode, setCountryCode] = useState<number | null>(null);
    const [storeCountryCodeId, setStoreCountryCodeId] = useState<number | null>(null);
    const navigator = useNavigate();

    useEffect(() => {
        if (tokenStorage.get() === null) {
            toast.error("You must be logged in to view this page.");
            navigator("/main");
        }
    }, [navigator]);

    async function fetchCountries() {
        try {
            const countriesRaw = await apiCallWithManualRefresh(() => getCountries());
            const normalizedCountries = Array.isArray(countriesRaw)
                ? countriesRaw.map((c: any) => ({ id: Number(c.id), name: c.name, code: c.code ?? "UN" }))
                : [];
            setCountries(normalizedCountries);
        } catch (err) {
        }
    }

    async function fetchCategories() {
        try {
            const categoriesRaw = await apiCallWithManualRefresh(() => getCategories());
            const normalizedCategories = Array.isArray(categoriesRaw)
                ? categoriesRaw.map((cat: any) => ({ id: String(cat.id), name: cat.categoryName || cat.name, parentCategoryId: cat.parentCategoryId ?? null }))
                : [];
            setCategories(normalizedCategories);
        } catch (err) {
        }
    }

    async function fetchSellerProfile() {
        try {
            setLoading(true);
            const profile = await apiCallWithManualRefresh(() => getSellerProfile(sellerIdFromUrl));
            setIsVerified(profile?.isVerified || false);
            if (!profile) {
                setSeller(null);
                toast.error("Failed to fetch profile: No data returned.");
                return;
            }
            setSeller(profile);
            setEditedTaxId(profile.taxId || "");
            setEditedTaxNumber(profile.taxNumber || "");
            if (profile.emailConfirmed === false) {
                toast.info("Your email is not confirmed. Please check your inbox.");
            }
        } catch (err) {
            toast.error("Failed to fetch seller profile.");
        }
        finally {
            setLoading(false);
        }
    }

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            if (!seller) return;
            // Check all required fields for emptiness
            const requiredFields = [
                seller?.editedName || seller?.name,
                seller?.editedSurname || seller?.surname,
                seller?.editedEmail || seller?.email,
                seller?.editedPhone || seller?.phone,
                seller?.editedPassportNumber || seller?.passportNumber,
                countryCode || seller?.countryCitizenshipId,
                seller?.editedStoreName || seller?.storeName,
                seller?.editedStoreDescription || seller?.storeDescription,
                seller?.editedStoreContactPhone || seller?.storeContactPhone,
                seller?.editedStoreContactEmail || seller?.storeContactEmail,
                editedTaxId,
                editedTaxNumber,
                storeCountryCodeId || seller?.storeCountryCodeId,
                seller?.editedStreet || seller?.street,
                seller?.editedCity || seller?.city,
                seller?.editedState || seller?.state,
                seller?.editedPostalCode || seller?.postalCode,
                editedCategoryId || seller?.categoryId
            ];
            if (requiredFields.some(field => field === null || field === undefined || field === "")) {
                toast.error("All fields are required. Please fill in all fields before saving.");
                setLoading(false);
                return;
            }
            const payload: any = {
                name: seller?.editedName || seller?.name,
                surname: seller?.editedSurname || seller?.surname,
                email: seller?.editedEmail || seller?.email,
                phone: seller?.editedPhone || seller?.phone,
                passportNumber: seller?.editedPassportNumber || seller?.passportNumber,
                isVerified: isVerified || false,
                countryCitizenshipId: countryCode || seller?.countryCitizenshipId,
                storeName: seller?.editedStoreName || seller?.storeName,
                storeDescription: seller?.editedStoreDescription || seller?.storeDescription,
                storeContactPhone: seller?.editedStoreContactPhone || seller?.storeContactPhone,
                storeContactEmail: seller?.editedStoreContactEmail || seller?.storeContactEmail,
                taxId: editedTaxId,
                taxNumber: editedTaxNumber,
                storeCountryCodeId: storeCountryCodeId || seller?.storeCountryCodeId,
                street: seller?.editedStreet || seller?.street,
                city: seller?.editedCity || seller?.city,
                state: seller?.editedState || seller?.state,
                postalCode: seller?.editedPostalCode || seller?.postalCode,
                categoryId: editedCategoryId || seller?.categoryId,
            };

            let objectName = null;
            let storeLogoUrl = null;
            if (seller?.storeImageFile) {
                objectName = await uploadImage(seller.storeImageFile as File);
                storeLogoUrl = await getImage(objectName);
                payload.storeLogo = objectName;
            }

            const token = tokenStorage.get();
            if (!token) {
                toast.error("You need to log in again.");
                navigator("/login");
                return;
            }
            const result = await apiCallWithManualRefresh(() => editSellerProfile(sellerIdFromUrl, payload));
            if (!result || !result.isSuccess) {
                toast.error(result?.message || "Profile update failed. Please check your details.");
                setLoading(false);
                return;
            }
            toast.success("Profile updated successfully!");
            if (storeLogoUrl) setSeller({ ...seller, ...payload, storeLogo: storeLogoUrl });
            else setSeller({ ...seller, ...payload });
            setEditMode(false);
        } catch (error: any) {
            if (error?.response?.data) {
                const data = error.response.data;
                if (data.errors && typeof data.errors === "object") {
                    Object.values(data.errors).forEach((msgs: any) => {
                        if (Array.isArray(msgs)) msgs.forEach((m: string) => toast.error(m));
                    });
                }
                if (data.message || data.Message) toast.error(data.message || data.Message);
                if (typeof data === "string") toast.error(data);
            } else {
                toast.error("Profile update failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCountries(),
                    fetchCategories(),
                    (async () => {
                        try {
                            const taxesRaw = await apiCallWithManualRefresh(() => import("@/features/profile/Tax/tax.service").then(m => m.getTaxes()));
                            const normalizedTaxes = Array.isArray(taxesRaw)
                                ? taxesRaw.map((t: any) => ({ id: Number(t.id), name: t.name, RegexPattern: t.RegexPattern }))
                                : [];
                            setTaxes(normalizedTaxes);
                        } catch (err) {
                        }
                    })(),
                    fetchSellerProfile()
                ]);
            } catch (err) {
                toast.error("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCrop = async (croppedImageUrl: string) => {
        try {
            const response = await fetch(croppedImageUrl);
            const blob = await response.blob();
            const file = new File([blob], "profile.png", { type: blob.type });
            setSeller((prev: any) => ({
                ...prev,
                storeImageFile: file,
                storeImageUrl: croppedImageUrl // local preview
            }));
            setCropperOpen(false);
            toast.success("Cropped image ready to save. Click Save to upload.");
        } catch (err) {
            toast.error("Failed to process cropped image");
        }
    };

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
                <div className="flex-1 py-8 px-2 md:px-8 flex flex-col items-center">
                    <Card className="w-full mt-8">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <Button onClick={() => navigator(-1)} className="text-sm text-indigo-600 bg-transparent hover:text-indigo-500 hover:bg-indigo-100">← Back</Button>
                                        {('Profile')}
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center mb-6">
                                {seller ? (
                                    editMode ? (
                                        seller.storeImageUrl ? (
                                            <img src={seller.storeImageUrl} alt="Avatar" className="w-24 h-24 rounded-full border mb-2" onClick={() => setCropperOpen(true)} style={{ cursor: "pointer" }} />
                                        ) : seller.storeLogo ? (
                                            <img src={seller.storeLogo} alt="Avatar" className="w-24 h-24 rounded-full border mb-2" onClick={() => setCropperOpen(true)} style={{ cursor: "pointer" }} />
                                        ) : (
                                            <span className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400" style={{ fontSize: "96px", cursor: "pointer" }} onClick={() => setCropperOpen(true)}>
                                                <MdAccountCircle />
                                            </span>
                                        )
                                    ) : seller.storeImageUrl ? (
                                        <img src={seller.storeImageUrl} alt="Avatar" className="w-24 h-24 rounded-full border mb-2" />
                                    ) : seller.storeLogo ? (
                                        <img src={seller.storeLogo} alt="Avatar" className="w-24 h-24 rounded-full border mb-2" />
                                    ) : (
                                        <span className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400" style={{ fontSize: "96px" }}>
                                            <MdAccountCircle />
                                        </span>
                                    )
                                ) : (
                                    <span className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400" style={{ fontSize: "96px" }}>
                                        <MdAccountCircle />
                                    </span>
                                )}
                                {editMode && seller && (
                                    <div className="text-sm text-gray-500 mb-2">
                                        <Label>Click {seller.storeImageUrl ? "image" : "icon"} to change</Label>
                                        <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                                            <DialogContent className="min-w-2xl w-full">
                                                <ImageCropper onCrop={handleCrop} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>

                            <form className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                    <div className="w-full md:flex-1 min-w-[280px] order-1 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Personal Info</h3>
                                        <div className="mb-3">
                                            <Label className="mb-2">Name</Label>
                                            {!editMode ? <Input value={seller?.name ?? ""} disabled /> : <Input value={seller?.editedName ?? seller?.name ?? ""} onChange={(e) => setSeller({ ...seller, editedName: e.target.value })} />}
                                        </div>
                                        <div className="mb-3">
                                            <Label className="mb-2">Surname</Label>
                                            {!editMode ? <Input value={seller?.surname ?? ""} disabled /> : <Input value={seller?.editedSurname ?? seller?.surname ?? ""} onChange={(e) => setSeller({ ...seller, editedSurname: e.target.value })} />}
                                        </div>
                                        <div className="mb-3">
                                            <Label>Email
                                            </Label>
                                            {!editMode ? <Input type="email" value={seller?.email ?? ""} disabled /> : <Input type="email" value={seller?.editedEmail ?? seller?.email ?? ""} onChange={(e) => setSeller({ ...seller, editedEmail: e.target.value })} />}
                                        </div>
                                        <div className="mb-3">
                                            <Label className="mb-2">Phone</Label>
                                            {!editMode ? <Input value={seller?.phone ?? ""} disabled /> : <Input value={seller?.editedPhone ?? seller?.phone ?? ""} onChange={(e) => setSeller({ ...seller, editedPhone: e.target.value })} />}
                                        </div>

                                        <div className="col-span-2 mb-2">
                                            <Label className="mb-2">Country</Label>
                                            {!editMode ? (
                                                <Label className="text-lg">
                                                    <div className="flex flex-cols items-center gap-2">
                                                        {(() => {
                                                            const country = countries.find((c) => String(c.id) === String(seller?.countryCitizenshipId));
                                                            const flagUrl = country?.code ? `https://flagsapi.com/${country.code}/flat/24.png` : "https://flagsapi.com/UN/flat/24.png";
                                                            return country ? (
                                                                <>
                                                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                                                    {country.name}
                                                                </>
                                                            ) : (
                                                                <span>{"Country not found"}</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </Label>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const selectedCountry = countries.find((c) => c.id === (countryCode || seller?.countryCitizenshipId));
                                                        const flagUrl = selectedCountry?.code ? `https://flagsapi.com/${selectedCountry.code}/flat/24.png` : "https://flagsapi.com/UN/flat/24.png";
                                                        return <img src={flagUrl} alt={selectedCountry ? `${selectedCountry.name} flag` : "No flag"} />;
                                                    })()}
                                                    <select value={countryCode ?? seller?.countryCitizenshipId ?? ""} onChange={(e) => setCountryCode(Number(e.target.value))} required className="border rounded px-2 py-1">
                                                        <option value="">Select country</option>
                                                        {countries.map((country) => (
                                                            <option key={country.id} value={country.id}>
                                                                {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">Passport Number</Label>
                                            {!editMode ? <Input value={seller?.passportNumber ?? ""} disabled /> : <Input value={seller?.editedPassportNumber ?? seller?.passportNumber ?? ""} onChange={(e) => setSeller({ ...seller, editedPassportNumber: e.target.value })} />}
                                        </div>

                                        <div className="mb-3 flex items-center gap-2">
                                            <label className="block text-sm font-medium mb-1">Is Verified: </label>
                                            <span className={(isVerified ? "text-green-600" : "text-red-600") + " font-medium text-sm mb-1"}>{isVerified ? "Verified" : "Unverified"}</span>
                                            <Switch checked={isVerified} onCheckedChange={setIsVerified} disabled={!editMode} />
                                        </div>
                                    </div>

                                    <div className="w-full md:flex-1 min-w-[220px] order-2 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Info</h3>

                                        <div className="mb-3">
                                            <Label className="mb-2">Shop Name</Label>
                                            {!editMode ? <Input value={seller?.storeName ?? ""} disabled /> : <Input value={seller?.editedStoreName ?? seller?.storeName ?? ""} onChange={(e) => setSeller({ ...seller, editedStoreName: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">Store Contact Phone</Label>
                                            {!editMode ? <Input value={seller?.storeContactPhone ?? ""} disabled /> : <Input value={seller?.editedStoreContactPhone ?? seller?.storeContactPhone ?? ""} onChange={(e) => setSeller({ ...seller, editedStoreContactPhone: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">Store Contact Email</Label>
                                            {!editMode ? <Input type="email" value={seller?.storeContactEmail ?? ""} disabled /> : <Input type="email" value={seller?.editedStoreContactEmail ?? seller?.storeContactEmail ?? ""} onChange={(e) => setSeller({ ...seller, editedStoreContactEmail: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">Store Description</Label>
                                            {!editMode ? <textarea value={seller?.storeDescription ?? ""} disabled className="w-full border rounded p-2 resize-none max-h-[100px]" /> : <textarea value={seller?.editedStoreDescription ?? seller?.storeDescription ?? ""} onChange={(e) => setSeller({ ...seller, editedStoreDescription: e.target.value })} className="w-full border rounded p-2 resize-none max-h-[100px]" />}
                                        </div>

                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Address Info</h3>
                                            <Label className="mb-2">Street</Label>
                                            {!editMode ? <Input value={seller?.street ?? ""} disabled /> : <Input value={seller?.editedStreet ?? seller?.street ?? ""} onChange={(e) => setSeller({ ...seller, editedStreet: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">City</Label>
                                            {!editMode ? <Input value={seller?.city ?? ""} disabled /> : <Input value={seller?.editedCity ?? seller?.city ?? ""} onChange={(e) => setSeller({ ...seller, editedCity: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">State</Label>
                                            {!editMode ? <Input value={seller?.state ?? ""} disabled /> : <Input value={seller?.editedState ?? seller?.state ?? ""} onChange={(e) => setSeller({ ...seller, editedState: e.target.value })} />}
                                        </div>

                                        <div className="mb-3">
                                            <Label className="mb-2">Postal Code</Label>
                                            {!editMode ? <Input value={seller?.postalCode ?? ""} disabled /> : <Input value={seller?.editedPostalCode ?? seller?.postalCode ?? ""} onChange={(e) => setSeller({ ...seller, editedPostalCode: e.target.value })} />}
                                        </div>

                                        <div className="col-span-2">
                                            <Label className="mb-2">Store Address Country</Label>
                                            {!editMode ? (
                                                <Label className="text-lg">
                                                    <div className="flex flex-cols items-center gap-2">
                                                        {(() => {
                                                            const country = countries.find((c) => String(c.id) === String(seller?.storeCountryCodeId));
                                                            const flagUrl = country?.code ? `https://flagsapi.com/${country.code}/flat/24.png` : "https://flagsapi.com/UN/flat/24.png";
                                                            return country ? (
                                                                <>
                                                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                                                    {country.name}
                                                                </>
                                                            ) : (
                                                                <span>{"Country not found"}</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </Label>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const selectedCountry = countries.find((c) => c.id === (storeCountryCodeId || seller?.storeCountryCodeId));
                                                        const flagUrl = selectedCountry?.code ? `https://flagsapi.com/${selectedCountry.code}/flat/24.png` : "https://flagsapi.com/UN/flat/24.png";
                                                        return <img src={flagUrl} alt={selectedCountry ? `${selectedCountry.name} flag` : "No flag"} />;
                                                    })()}
                                                    <select value={storeCountryCodeId ?? seller?.storeCountryCodeId ?? ""} onChange={(e) => setStoreCountryCodeId(Number(e.target.value))} required className="border rounded px-2 py-1">
                                                        <option value="">Select country</option>
                                                        {countries.map((country) => (
                                                            <option key={country.id} value={country.id}>
                                                                {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3 mt-5">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Tax ID Type</h3>
                                            <label className="block text-sm font-medium mb-1">Tax ID Type</label>
                                            {editMode ? (
                                                <select value={editedTaxId} onChange={(e) => setEditedTaxId(e.target.value ? Number(e.target.value) : "")} className="border rounded px-2 py-1 w-full" >
                                                    <option value="">Select tax type</option>
                                                    {taxes.map((tax) => (
                                                        <option key={tax.id} value={tax.id}>{tax.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Label className="text-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span>{seller?.taxId ? (taxes.find(t => t.id === seller.taxId)?.name || seller.taxId) : "Tax type not found"}</span>
                                                    </div>
                                                </Label>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Tax Number</label>
                                            <Input value={editMode ? editedTaxNumber : seller?.taxNumber ?? ""} onChange={(e) => setEditedTaxNumber(e.target.value)} disabled={!editMode} placeholder="e.g. TAX-2025-00123" />
                                        </div>

                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Category Info</h3>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            {editMode ? (
                                                <select value={editedCategoryId || seller?.categoryId} onChange={(e) => setEditedCategoryId(e.target.value)} className="border rounded px-2 py-1 w-full" disabled={categories.length === 0}>
                                                    <option value="">Select a category</option>
                                                    {categories.filter((cat) => cat.parentCategoryId === null).map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Label className="text-lg">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const category = categories.filter((cat) => cat.parentCategoryId === null).find((cat) => String(cat.id) === String(seller?.categoryId));
                                                            return category ? <>{category.name}</> : <span style={{ color: "gray" }}>{seller?.categoryId ? seller.categoryId : "Category not found"}</span>;
                                                        })()}
                                                    </div>
                                                </Label>
                                            )}
                                        </div>


                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex gap-2 mt-4">
                                        {!editMode ? (
                                            <Button type="button" onClick={() => setEditMode(true)}>
                                                Edit Profile
                                            </Button>
                                        ) : (
                                            <>
                                                <Button type="button" onClick={handleSaveProfile}>
                                                    Save
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Member since: {new Date(seller?.createdAt ?? Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}