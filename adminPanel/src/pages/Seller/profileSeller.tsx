import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactCountryFlag from "react-country-flag";
import Navbar from "../../components/custom/Navbar/navbar";
import { AppSidebar } from "@/components/custom/sidebar";
import { Eye, EyeOff } from "lucide-react";
import ImageCropper from "@/components/ui/image-crop"; // Import the ImageCropper component
import { Label } from "@/components/ui/label";
import { MdAccountCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function ProfileSeller() {//It must accept the userId as prop to fetch the data
    const [showCurrent, setShowCurrent] = useState(false);
    const navigate = useNavigate();
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [cropperOpen, setCropperOpen] = useState(false); // State to control cropper modal
    // Simulate hashed password for demo (in real app, never store plain password)
    const [hashedPassword, setHashedPassword] = useState("AA1234567");  //test
    const handleOpenPasswordModal = () => {
        setShowPasswordModal(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    };

        // Handler for toggling seller verification
        const handleToggleVerifySeller = () => {
            setProfile((prev) => ({ ...prev, isVerified: !prev.isVerified }));
            toast.success(`Seller has been ${profile.isVerified ? "unverified" : "verified"}!`);
        };

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
    const [profile, setProfile] = useState({
        // User fields
        name: "John",
        surname: "Doe",
        email: "seller@example.com",
        phone: "+1 555-123-4567",
        country: "US",
        avatar: null, // StoreLogoUrl/ImageUrl
        idPassport: "AA1234567",
        emailConfirmed: false,
        // SellerProfile fields
        storeName: "My Awesome Store",
        storeDescription: "Passionate seller providing the best products!",
        storeLogoUrl: "/src/assets/images/ShahLogo2.png",
        contactEmail: "seller@example.com",
        contactPhone: "+1 555-987-6543",
        categoryId: "electronics-1",
        isVerified: false,
        sellerTaxInfoId: "TAX-2025-00123",
        taxIdType: "VAT", // New field
        createdAt: "2024-01-15T10:00:00Z", // New field
        // Address object
        address: {
            street: "123 Market St",
            city: "Cityville",
            state: "",
            postalCode: "",
            country: "US"
        }
    });
    const [editMode, setEditMode] = useState(false);
    const [editValues, setEditValues] = useState(profile);


    // List of countries for the selector (add more as needed)
    const countries = [
        { code: "US", name: "United States" },
        { code: "GB", name: "United Kingdom" },
        { code: "DE", name: "Germany" },
        { code: "FR", name: "France" },
        { code: "AZ", name: "Azerbaijan" },
        { code: "TR", name: "Turkey" },
        { code: "IN", name: "India" },
        { code: "CN", name: "China" },
        { code: "RU", name: "Russia" },
        { code: "JP", name: "Japan" },
    ];

    // List of categories for the selector
    const categories = [
        { id: "electronics-1", name: "Electronics" },
        { id: "fashion-2", name: "Fashion" },
        { id: "home-3", name: "Home & Garden" },
        { id: "beauty-4", name: "Beauty & Health" },
        { id: "sports-5", name: "Sports & Outdoors" },
        { id: "toys-6", name: "Toys & Hobbies" },
        { id: "auto-7", name: "Automotive" },
        { id: "books-8", name: "Books" },
        { id: "other-9", name: "Other" },
    ];

    // List of tax ID types for the selector
    const taxIdTypes = [
        { id: "VAT", name: "VAT" },
        { id: "TIN", name: "TIN" },
        { id: "EIN", name: "EIN" },
        { id: "SSN", name: "SSN" },
        { id: "GST", name: "GST" },
        { id: "CIF", name: "CIF" },
        { id: "PAN", name: "PAN" },
        { id: "Other", name: "Other" },
    ];

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

    const handleSave = () => {
        setProfile(editValues);
        setEditMode(false);
        toast.success("Profile updated successfully.", {
            description: `Your profile changes have been saved.`
        });
    };

    const handleCancel = () => {
        setEditValues(profile);
        setEditMode(false);
        toast.info("Edit cancelled.", {
            description: `No changes were saved.`
        });
    };

    // Handler for avatar crop
    const handleCrop = (croppedImage: string) => {
        setEditValues((prev) => ({ ...prev, avatar: croppedImage, storeLogoUrl: croppedImage }));
        setCropperOpen(false);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <AppSidebar />
                <div className="flex-1 py-8 px-2 md:px-8 flex flex-col items-center">
                    <Card className="w-full mt-8">
                        <Button variant="outline" className="m-4 w-[70px]" onClick={() => navigate(-1)}>
                            ← Back
                        </Button>
                        <CardHeader>
                            <CardTitle>Edit and Check Seller Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center mb-6">
                                <label htmlFor="avatar-upload" className={editMode ? "cursor-pointer" : undefined}>
                                    {editMode ? (
                                        editValues.avatar ? (
                                            <img
                                                src={editValues.avatar}
                                                alt="Avatar"
                                                className="w-24 h-24 rounded-full border mb-2 cursor-pointer"
                                                onClick={() => setCropperOpen(true)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ) : (
                                            <MdAccountCircle size={96} className="text-gray-400 mb-2 cursor-pointer" onClick={() => setCropperOpen(true)} />
                                        )
                                    ) : (
                                        profile.avatar ? (
                                            <img
                                                src={profile.avatar}
                                                alt="Avatar"
                                                className="w-24 h-24 rounded-full border mb-2"
                                            />
                                        ) : (
                                            <MdAccountCircle size={96} className="text-gray-400 mb-2" />
                                        )
                                    )}
                                </label>
                                {
                                    editMode && (
                                        <div className="text-sm text-gray-500 mb-2">
                                            <Label>Click image to change</Label>
                                            <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                                                <DialogContent className="min-w-2xl w-full">
                                                    <ImageCropper onCrop={handleCrop} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )
                                }

                            </div>
                            <form className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-start gap-8">
                                    {/* Personal Info */}
                                    <div className="flex-1 min-w-[220px] order-1 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Personal Info</h3>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <Input
                                                name="name"
                                                value={editMode ? editValues.name : profile.name}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. John"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Surname</label>
                                            <Input
                                                name="surname"
                                                value={editMode ? editValues.surname : profile.surname}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. Doe"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Email {
                                                <span className={profile.emailConfirmed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                    {profile.emailConfirmed ? "Email Confirmed" : "Email Not Confirmed"}</span>
                                            }</label>
                                            <Input
                                                name="email"
                                                value={editMode ? editValues.email : profile.email}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="m@example.com"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Phone</label>
                                            <Input
                                                name="phone"
                                                value={editMode ? editValues.phone : profile.phone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. +1 555-123-4567"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Country Cityzen</label>
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    <ReactCountryFlag
                                                        countryCode={editMode ? editValues.country : profile.country}
                                                        svg
                                                        style={{ width: "1.5em", height: "1.5em" }}
                                                    />
                                                </span>
                                                {editMode ? (
                                                    <select
                                                        name="country"
                                                        value={editValues.country}
                                                        onChange={handleChange}
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        {countries.map((c) => (
                                                            <option key={c.code} value={c.code}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="ml-1 text-sm">{
                                                        countries.find((c) => c.code === profile.country)?.name || profile.country
                                                    }</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">ID/Passport</label>
                                            <Input
                                                name="idPassport"
                                                value={profile.idPassport}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    {/* Shop Info */}
                                    <div className="flex-1 min-w-[220px] order-2 md:order-none">
                                        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Shop Info</h3>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Shop Name</label>
                                            <Input
                                                name="storeName"
                                                value={editMode ? editValues.storeName : profile.storeName}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Contact Phone</label>
                                            <Input
                                                name="contactPhone"
                                                value={editMode ? editValues.contactPhone : profile.contactPhone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. +1 555-987-6543"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Contact Email</label>
                                            <Input
                                                name="contactEmail"
                                                value={editMode ? editValues.contactEmail : profile.contactEmail}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. seller@example.com"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Store Description</label>
                                            <textarea
                                                name="storeDescription"
                                                value={editMode ? editValues.storeDescription : profile.storeDescription}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                className="w-full border rounded p-2 resize-none max-h-[100px] "
                                                placeholder="Describe your store"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Street</label>
                                            <Input
                                                name="address.street"
                                                value={editMode ? editValues.address.street : profile.address.street}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. 123 Market St"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">City</label>
                                            <Input
                                                name="address.city"
                                                value={editMode ? editValues.address.city : profile.address.city}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. Cityville"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">State</label>
                                            <Input
                                                name="address.state"
                                                value={editMode ? editValues.address.state : profile.address.state}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. State/Region"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Postal Code</label>
                                            <Input
                                                name="address.postalCode"
                                                value={editMode ? editValues.address.postalCode : profile.address.postalCode}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. 12345"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Address Country</label>
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    <ReactCountryFlag
                                                        countryCode={editMode ? editValues.address.country : profile.address.country}
                                                        svg
                                                        style={{ width: "1.5em", height: "1.5em" }}
                                                    />
                                                </span>
                                                {editMode ? (
                                                    <select
                                                        name="address.country"
                                                        value={editValues.address.country}
                                                        onChange={handleChange}
                                                        className="border rounded px-2 py-1 w-full"
                                                    >
                                                        {countries.map((c) => (
                                                            <option key={c.code} value={c.code}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="ml-1 text-sm">{
                                                        countries.find((c) => c.code === profile.address.country)?.name || profile.address.country
                                                    }</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Contact Phone</label>
                                            <Input
                                                name="contactPhone"
                                                value={editMode ? editValues.contactPhone : profile.contactPhone}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. +1 555-987-6543"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Tax ID Type</label>
                                            {editMode ? (
                                                <select
                                                    name="taxIdType"
                                                    value={editValues.taxIdType}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                >
                                                    {taxIdTypes.map((type) => (
                                                        <option key={type.id} value={type.id}>{type.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Input
                                                    name="taxIdType"
                                                    value={taxIdTypes.find((type) => type.id === profile.taxIdType)?.name || profile.taxIdType}
                                                    disabled
                                                />
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Seller Tax Info ID</label>
                                            <Input
                                                name="sellerTaxInfoId"
                                                value={editMode ? editValues.sellerTaxInfoId : profile.sellerTaxInfoId}
                                                onChange={handleChange}
                                                disabled={!editMode}
                                                placeholder="e.g. TAX-2025-00123"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            {editMode ? (
                                                <select
                                                    name="categoryId"
                                                    value={editValues.categoryId}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <Input
                                                    name="categoryId"
                                                    value={categories.find((cat) => cat.id === profile.categoryId)?.name || profile.categoryId}
                                                    disabled
                                                />
                                            )}
                                        </div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <label className="block text-md font-medium mb-1">Is Verified</label>
                                            <span className={profile.isVerified ? "text-green-600" : "text-red-600"}>
                                                {profile.isVerified ? "Verified" : "Unverified"}
                                            </span>
                                            {editMode && (
                                                <Button type="button" variant="outline" onClick={handleToggleVerifySeller}>
                                                    {profile.isVerified ? "Unverify Seller" : "Verify Seller"}
                                                </Button>
                                            )}
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
                                                <Button type="button" variant="outline" onClick={handleCancel}>
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Member since: {new Date(profile.createdAt).toLocaleDateString()}</span>
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