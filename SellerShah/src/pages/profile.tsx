import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Navbar from "../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Eye, EyeOff } from "lucide-react";
import ImageCropper from "@/components/ui/image-crop";
import { MdAccountCircle } from "react-icons/md";
import { getCountries } from "@/features/profile/Country/country.service";
import { getCategories } from "@/features/profile/Category/category.service";
import { getTaxes } from "@/features/profile/Tax/tax.service";
import Spinner from "@/components/custom/loader";
import { getSellerProfile, editSellerProfile } from "@/features/profile/ProfileServices/profile.service";
import { tokenStorage } from "@/shared/tokenStorage";
import { jwtDecode } from "jwt-decode";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";

export default function ProfileSeller() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [cropperOpen, setCropperOpen] = useState(false); // State to control cropper modal
    const [loading, setLoading] = useState(false);

    const navigator = useNavigate();
    // Simulate hashed password for demo (in real app, never store plain password)
    const [hashedPassword, setHashedPassword] = useState();  //test
    const handleOpenPasswordModal = () => {
        setShowPasswordModal(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };
    const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
    const [taxes, setTaxes] = useState<Array<{ id: string; name: string; regexPattern: string }>>([]);
    const [categories, setCategories] = useState<Array<{ id: string; name: string; parentCategoryId: string | null }>>([]);
    const [seller, setSeller] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [editValues, setEditValues] = useState<any>({});
    const [countryCitizenshipId, setCountryCitizenshipId] = useState<number | null>(null);
    const [countryCode, setCountryCode] = useState<number | null>(null);
    const [storeCountryCode, setStoreCountryCode] = useState<number | null>(null);



    if (tokenStorage.get() === null) {
        toast.error("You must be logged in to view this page.");
        navigator('/main');
    }

    async function fetchTaxes() {
        const taxes = await getTaxes();
        setTaxes(taxes.data ? taxes.data : []);
    }

    async function fetchCountries() {
        const result = await getCountries();
        setCountries(Array.isArray(result) ? result : result.data);
    }

    async function fetchCategories() {
        const categories = await getCategories();
        setCategories(Array.isArray(categories) ? categories : []);
    }


    async function fetchSellerProfile() {
        const token = tokenStorage.get();
        if (!token) return;
        const decoded: any = jwtDecode(token);
        const sellerId = decoded.seller_profile_id;
        const profile = await getSellerProfile(sellerId);
        const mappedProfile = mapSellerProfile(profile.data ? profile.data : profile);
        console.log("Mapped Profile:", mappedProfile);
        setSeller(mappedProfile);
        setEditValues(mappedProfile);
        setCountryCitizenshipId(mappedProfile.countryCitizenshipId); // Set countryCitizenshipId
    }

    useEffect(() => {
        try {
            setLoading(true);
            fetchCountries();
            fetchTaxes();
            fetchCategories();
            fetchSellerProfile();
        }
        catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast.error("Failed to load profile data. Please try again later.");
            navigator('/main');
        } finally {
            setLoading(false);
        }

    }, []);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate hash check (replace with real hash check in production)
        if (currentPassword !== hashedPassword) {
            toast.error("Current password is incorrect.");
            return;
        }
        // Regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            toast.error("Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        setHashedPassword(newPassword); // Simulate password change
        setShowPasswordModal(false);
        toast.success("Password changed successfully.");
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update country and store country codes in editValues if changed
            let updatedValues = { ...editValues };
            if (countryCode !== null) {
                updatedValues.countryCitizenshipId = countryCode;
            }
            if (storeCountryCode !== null) {
                updatedValues.storeCountryCodeId = storeCountryCode;
            }

            // Validate required fields (example: name, email, storeName)
            if (!updatedValues.name || !updatedValues.email || !updatedValues.storeName) {
                toast.error("Please fill in all required fields: Name, Email, and Store Name.");
                setLoading(false);
                return;
            }

            const token = tokenStorage.get();
            if (!token) {
                toast.error("No authentication token found.");
                setLoading(false);
                return;
            }
            const decoded: any = jwtDecode(token);
            const sellerId = decoded.seller_profile_id;
            console.log("Updating seller profile with values:", updatedValues);
            const result = await editSellerProfile(sellerId, updatedValues);
            if (result && result.isSuccess) {
                setSeller({ ...seller, ...updatedValues });
                setEditMode(false);
                toast.success("Profile updated successfully.");
            } else {
                toast.error("Failed to update profile. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while saving the profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        if (type === "file" && files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditValues((prev) => ({ ...prev, avatar: reader.result as string, storeLogoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else if (name.startsWith("address.")) {
            const addrField = name.split(".")[1];
            setEditValues((prev) => ({ ...prev, address: { ...prev.address, [addrField]: value } }));
        } else {
            setEditValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handler for avatar crop
    const handleAvatarCrop = (croppedImage: string) => {
        setEditValues((prev: any) => ({ ...prev, storeLogo: croppedImage, storeLogoUrl: croppedImage }));
        toast.success("The store logo is ready, please save the profile to apply changes.");
        setCropperOpen(false);
    };

    function mapSellerProfile(data: any) {
        return {
            name: data.name,
            surname: data.surname,
            email: data.email,
            phone: data.phone,
            passportNumber: data.passportNumber,
            countryCitizenshipId: data.countryCitizenshipId,
            storeLogo: data.storeLogo,
            storeName: data.storeName,
            storeDescription: data.storeDescription,
            storeContactPhone: data.storeContactPhone,
            storeContactEmail: data.storeContactEmail,
            taxId: data.taxId,
            taxNumber: data.taxNumber,
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            storeCountryCodeId: data.storeCountryCodeId,
            categoryId: data.categoryId,
            isConfirmed: data.isConfirmed,
        };
    }

    return (
        <>
            {loading && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner />
                </div>
            )}
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 flex flex-col items-center">
                    <Card className="w-full mt-8">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center mb-6">
                                <label htmlFor="avatar-upload" className={editMode ? "cursor-pointer" : undefined}>
                                    <span
                                        className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                                        style={editMode ? { cursor: 'pointer', fontSize: '96px' } : { fontSize: '96px' }}
                                    >
                                        {editMode
                                            ? (editValues.storeLogo || editValues.storeLogoUrl)
                                                ? <img src={editValues.storeLogo || editValues.storeLogoUrl} alt="Store Logo" className="w-24 h-24 rounded-full object-cover" />
                                                : <MdAccountCircle />
                                            : seller?.storeLogo
                                                ? <img src={seller.storeLogo} alt="Store Logo" className="w-24 h-24 rounded-full object-cover" />
                                                : <MdAccountCircle />
                                        }
                                    </span>
                                </label>
                                {editMode && (
                                    <div className="text-sm text-gray-500">
                                        <Button variant="outline" size="sm" onClick={() => setCropperOpen(true)}>
                                            Change Avatar
                                        </Button>
                                        <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                                            <DialogContent className="min-w-2xl w-full">
                                                <ImageCropper onCrop={handleAvatarCrop} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                                {!editMode ? (
                                    <>
                                        <div className="text-lg font-semibold">{seller?.name}</div>
                                        <div className="text-gray-500 text-sm">{seller?.email}</div>
                                    </>
                                ) : null}
                            </div>
                            <form className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                                    {/* Personal Info */}
                                    <div className="w-full md:flex-1 min-w-[280px] order-1 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Personal Info</h3>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <Input
                                                name="name"
                                                value={editMode ? editValues.name : seller?.name}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. John"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Surname</label>
                                            <Input
                                                name="surname"
                                                value={editMode ? editValues.surname : seller?.surname}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. Doe"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Email {
                                                <span className={seller?.emailConfirmed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                    {seller?.emailConfirmed ? "Email Confirmed" : "Email Not Confirmed"}</span>
                                            }</label>
                                            <Input
                                                name="email"
                                                value={editMode ? editValues.email : seller?.email}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="m@example.com"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Phone</label>
                                            <Input
                                                name="phone"
                                                value={editMode ? editValues.phone : seller?.phone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. +1 555-123-4567"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Country</Label>
                                            {!editMode ? (
                                                <Label className="text-lg">
                                                    <div className="flex flex-cols items-center gap-2">
                                                        {(() => {
                                                            const country = countries.find(c => c.id === seller.countryCitizenshipId);
                                                            const flagUrl = country?.code
                                                                ? `https://flagsapi.com/${country.code}/flat/24.png`
                                                                : "https://flagsapi.com/UN/flat/24.png";
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
                                                        const selectedCountry = countries.find(
                                                            c => c.id === (countryCode || seller?.countryCitizenshipId)
                                                        );
                                                        const flagUrl = selectedCountry?.code
                                                            ? `https://flagsapi.com/${selectedCountry.code}/flat/24.png`
                                                            : "https://flagsapi.com/UN/flat/24.png";
                                                        return (
                                                            <img
                                                                src={flagUrl}
                                                                alt={selectedCountry ? `${selectedCountry.name} flag` : "No flag"}
                                                            />
                                                        );
                                                    })()}
                                                    <select
                                                        value={countryCode || seller?.countryCitizenshipId}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            setCountryCode(val);
                                                        }}
                                                        required
                                                        className="border rounded px-2 py-1"
                                                    >
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
                                            <label className="block text-sm font-medium mb-1">Passport Number</label>
                                            <Input
                                                name="passportNumber"
                                                value={seller?.passportNumber}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    {/* Shop Info */}
                                    <div className="w-full md:flex-1 min-w-[220px] order-2 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Info</h3>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Shop Name</label>
                                            <Input
                                                name="storeName"
                                                value={editMode ? editValues.storeName : seller?.storeName}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Contact Phone</label>
                                            <Input
                                                name="storeContactPhone"
                                                value={editMode ? editValues.storeContactPhone : seller?.storeContactPhone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. +1 555-987-6543"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Contact Email</label>
                                            <Input
                                                name="storeContactEmail"
                                                value={editMode ? editValues.storeContactEmail : seller?.storeContactEmail}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. seller@example.com"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Description</label>
                                            <textarea
                                                name="storeDescription"
                                                value={editMode ? editValues.storeDescription : seller?.storeDescription}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                className="w-full border rounded p-2 resize-none max-h-[100px] "
                                                placeholder="Describe your store"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Address Info</h3>
                                            <label className="block text-sm font-medium mb-1">Street</label>
                                            <Input
                                                name="address.street"
                                                value={editMode ? editValues.street : seller?.street}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. 123 Market St"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">City</label>
                                            <Input
                                                name="address.city"
                                                value={editMode ? editValues.city : seller?.city}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. Cityville"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">State</label>
                                            <Input
                                                name="address.state"
                                                value={editMode ? editValues.state : seller?.state}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. State/Region"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Postal Code</label>
                                            <Input
                                                name="address.postalCode"
                                                value={editMode ? editValues.postalCode : seller?.postalCode}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. 12345"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Store Address Country</Label>
                                            {!editMode ? (
                                                <Label className="text-lg">
                                                    <div className="flex flex-cols items-center gap-2">
                                                        {(() => {
                                                            const country = countries.find(c => c.id === seller.storeCountryCodeId);
                                                            const flagUrl = country?.code
                                                                ? `https://flagsapi.com/${country.code}/flat/24.png`
                                                                : "https://flagsapi.com/UN/flat/24.png";
                                                            return country ? (
                                                                <>
                                                                    <img src={flagUrl} alt={`${country.name} flag`} />
                                                                    {country.name}
                                                                </>
                                                            ) : (
                                                                <span>"Country not found"</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </Label>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const selectedCountry = countries.find(
                                                            c => c.id === (storeCountryCode || seller?.storeCountryCodeId)
                                                        );
                                                        const flagUrl = selectedCountry?.code
                                                            ? `https://flagsapi.com/${selectedCountry.code}/flat/24.png`
                                                            : "https://flagsapi.com/UN/flat/24.png";
                                                        return (
                                                            <img
                                                                src={flagUrl}
                                                                alt={selectedCountry ? `${selectedCountry.name} flag` : "No flag"}
                                                            />
                                                        );
                                                    })()}
                                                    <select
                                                        value={storeCountryCode || seller?.storeCountryCodeId}
                                                        onChange={e => {
                                                            const val = Number(e.target.value);
                                                            setStoreCountryCode(val);
                                                        }}
                                                        required
                                                        className="border rounded px-2 py-1"
                                                    >
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
                                                <select
                                                    name="taxes"
                                                    value={editValues.taxId}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                >
                                                    {taxes.map((type) => (
                                                        <option key={type.id} value={type.id}>{type.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Label className="text-lg">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const tax = taxes.find((tax) => String(tax.id) === String(seller?.taxId));
                                                            return tax ? (
                                                                <>{tax.name}</>
                                                            ) : (
                                                                <span style={{ color: 'gray' }}>{seller?.taxId ? seller.taxId : "Tax type not found"}</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </Label>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Tax Number</label>
                                            <Input
                                                name="taxNumber"
                                                value={editMode ? editValues.taxNumber : seller?.taxNumber}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. TAX-2025-00123"
                                            />
                                        </div>


                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">Category Info</h3>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            {editMode ? (
                                                <select
                                                    name="categoryId"
                                                    value={editValues.categoryId ? String(editValues.categoryId) : ""}
                                                    onChange={e => setEditValues((prev: any) => ({ ...prev, categoryId: e.target.value }))}
                                                    className="border rounded px-2 py-1 w-full"
                                                    disabled={categories.length === 0}
                                                >
                                                    <option value="">Select a category</option>
                                                    {categories.filter(cat => cat.parentCategoryId === null).map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.categoryName || cat.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Label className="text-lg">
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const category = categories.filter(cat => cat.parentCategoryId === null).find((cat) => String(cat.id) === String(seller?.categoryId));
                                                            return category ? (
                                                                <>{category.categoryName || category.name}</>
                                                            ) : (
                                                                <span style={{ color: 'gray' }}>{seller?.categoryId ? seller.categoryId : "Category not found"}</span>
                                                            );
                                                        })()}
                                                    </div>
                                                </Label>
                                            )}
                                        </div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <label className="block text-sm font-medium mb-1">Is Verified: </label>
                                            <span className={(seller?.isVerified ? "text-green-600" : "text-red-600") + " font-medium text-sm mb-1"}>
                                                {seller?.isVerified ? "Verified" : "Unverified"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex gap-2 mt-4">
                                        {!editMode ? (
                                            <>
                                                <Button type="button" onClick={() => setEditMode(true)}>
                                                    Edit Profile
                                                </Button>

                                            </>
                                        ) : (
                                            <>
                                                <Button type="button" onClick={handleSave}>
                                                    Save
                                                </Button>
                                                <Button type="button" onClick={handleOpenPasswordModal} variant="outline" className="ml-4">
                                                    Change Password
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Member since: {new Date(seller?.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {/* Change Password Modal */}
                                {showPasswordModal && (
                                    <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Change Password</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Current Password</label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showCurrent ? "text" : "password"}
                                                            value={currentPassword}
                                                            onChange={e => setCurrentPassword(e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                                            onClick={() => setShowCurrent(v => !v)}
                                                            tabIndex={-1}
                                                        >
                                                            {showCurrent ? <EyeOff /> : <Eye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">New Password</label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showNew ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={e => setNewPassword(e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                                            onClick={() => setShowNew(v => !v)}
                                                            tabIndex={-1}
                                                        >
                                                            {showNew ? <EyeOff /> : <Eye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirm ? "text" : "password"}
                                                            value={confirmNewPassword}
                                                            onChange={e => setConfirmNewPassword(e.target.value)}
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                                                            onClick={() => setShowConfirm(v => !v)}
                                                            tabIndex={-1}
                                                        >
                                                            {showConfirm ? <EyeOff /> : <Eye />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <Button type="submit">Change Password</Button>
                                                    <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}