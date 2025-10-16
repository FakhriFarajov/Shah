import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, type ChangeEvent } from "react"
import ImageCropper from "@/components/ui/image-crop"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Eye, EyeOff, Store } from "lucide-react"
import { Dialog, DialogContent } from "../ui/dialog"
import { MdAccountCircle } from "react-icons/md"
import type { RegisterRequest } from "@/features/account/DTOs/account.interfaces"
import { register } from "@/features/account/services/register.service"
import { useNavigate } from "react-router-dom"
import { login } from "@/features/auth/services/auth.service"
import { uploadProfileImage } from "@/shared/utils/imagePost"; // Use your actual image upload function



// Category and Tax ID Type lists (same as profile)
const categories = [
  { id: null, name: "Select category" },
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
const taxIdTypes = [
  { id: 1, name: "VAT" },
  { id: 2, name: "TIN" },
  { id: 3, name: "EIN" },
  { id: 4, name: "SSN" },
  { id: 5, name: "GST" },
  { id: 6, name: "CIF" },
  { id: 7, name: "PAN" },
  { id: 8, name: "Other" },
];

const countries = [
    { id: 1, code: "AZ", name: "Azerbaijan" },
    { id: 2, code: "TR", name: "Turkey" },
    { id: 3, code: "GE", name: "Georgia" },
    { id: 4, code: "RU", name: "Russia" },
];

export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation()
  const navigator = useNavigate();
  // Step 1 fields

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCitizenship, setCountryCitizenship] = useState(0);
  const [passport, setPassport] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Step 2 fields
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeContactPhone, setStoreContactPhone] = useState("");
  const [storeContactEmail, setStoreContactEmail] = useState("");
  const [taxIdType, setTaxIdType] = useState(0);
  const [taxIdNumber, setTaxIdNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [storeCountryCode, setStoreCountryCode] = useState(0);
  const [categoryId, setCategoryId] = useState<null | string>(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState<string>("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [pendingVariantIdx, setPendingVariantIdx] = useState<number | null>(null);
  // Ref for avatar file input
  const avatarInputRef = useState<HTMLInputElement | null>(null);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const user: RegisterRequest = {
      Name: name,
      Surname: surname,
      Email: email,
      Phone: phone,
      Passport: passport,
      CountryCitizenship: Number(countryCitizenship), // or correct enum value
      Password: password,
      ConfirmPassword: confirmPassword,
      StoreName: storeName,
      StoreDescription: storeDescription,
      StoreContactEmail: storeContactEmail,
      StoreContactPhone: storeContactPhone,
      TaxIdType: Number(taxIdType), // or correct enum value
      TaxIdNumber: taxIdNumber,
      Street: street,
      City: city,
      State: state,
      PostalCode: postalCode,
      StoreCountryCode: Number(storeCountryCode), // or correct enum value
      CategoryId: categoryId === "null" ? null : categoryId
    };
    console.log("Registering user:", user);


    try {
      const imageUrl = await uploadProfileImage(avatarFile);
      user.StoreLogoUrl = imageUrl;
      console.log("Registering user with image URL:", user);
      const result = await register(user);
      if (!result || !result.isSuccess) {
        toast.error(result.message || result.message || t('Registration failed. Please check your details.'));
        console.error("Registration error:", result);
        return;
      }
      toast.success(t('Registration successful!'));
      await login({ email, password });
      navigator('/main');
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
        // Fallback for string error
        if (typeof data === "string") {
          toast.error(data);
        }
        console.error("Registration error:", data);
      } else {
        toast.error(t('Registration failed. Please try again.'));
        console.error("Registration error:", error);
      }
    }
  };


  const handleCrop = async (croppedImageUrl: string) => {
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], "profile.png", { type: blob.type });
    setAvatarFile(file);
    setCropperOpen(false);
    toast.success("Cropped image ready to save. Click Save to upload.");
  };


  const handleAvatarClick = () => {
    const input = document.getElementById("avatar-upload") as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  };

  // Handle avatar file change
  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setCropperOpen(true);
    }
  };




  const [step, setStep] = useState(1);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname || !name || !passport || !email || !password || !confirmPassword) {
      toast.error(t('Please fill in all fields.'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('Passwords do not match.'));
      return;
    }
    setStep(2);
  };

  const handleAvatarCrop = async (croppedUrl: string) => {
    try {
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      const file = new File([blob], "avatar.png", { type: blob.type });
      setAvatarFile(file);
      setAvatar(croppedUrl); // For preview
      setCropperOpen(false);
      toast.success("Avatar cropped and ready!");
    } catch (err) {
      toast.error("Failed to process cropped image.");
    }
  };


  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-4xl mx-auto", className)} {...props}>
      <form onSubmit={step === 1 ? handleNext : handleRegister}>
        {cropperOpen && (
          <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
            <DialogContent className="min-w-2xl w-full">
              <ImageCropper onCrop={handleAvatarCrop} />
            </DialogContent>
          </Dialog>
        )}
        <div className="flex flex-col gap-6 ">
          <div className="flex flex-col items-center gap-2">
            <a
              href="/main"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex w-50 h-30 items-center justify-center rounded-md">
                <img
                  src={storeLogoPreview || "/src/assets/images/ShahLogo2.png"}
                  className="w-50 h-50"
                  alt={t("Company Logo")}
                />
              </div>
            </a>
            <h1 className="text-xl font-bold">{t("Welcome to Shah.")}</h1>
            <div className="text-center text-sm">
              {t("Already have an account?")} {" "}
              <a href="/login" className="underline underline-offset-4">
                {t("Sign in")}
              </a>
            </div>
          </div>
          {step === 1 ? (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
              <h1 className="border-b pb-2">Enter Personal Details</h1>
              <div className="grid gap-3">
                <Label htmlFor="name">{t("Name")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t("John")}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="surname">{t("Surname")}</Label>
                <Input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  placeholder={t("Doe")}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("m@example.com")}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phone">{t("Phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("055 555 55 55")}
                  required
                />
              </div>
              <div>
                <Label className="mb-4">{t("Country Citizen")}</Label>
                <select
                  id="country"
                  value={countryCitizenship}
                  onChange={(e) => setCountryCitizenship(Number(e.target.value))}
                  required
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="" disabled>{t("Select country")}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="idPassport">{t("ID/Passport")}</Label>
                <Input
                  id="idPassport"
                  type="text"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  required
                  placeholder={t("AB1234567")}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">{t("Password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t("*********")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">{t("Confirm Password")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={t("*********")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
              >
                {t("Next")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 gap-8 w-full">
                <div className="flex flex-col gap-6 justify-center">
                  <h1 className="border-b pb-2">{t("Store Information")}</h1>
                  <div className="flex flex-col items-center mb-6">
                    <span
                      className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                      style={{ cursor: 'pointer', fontSize: '96px' }}
                      onClick={handleAvatarClick}
                    >
                      {avatar ? (
                        <img src={avatar} alt={t("Avatar")} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <MdAccountCircle />
                      )}
                    </span>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarFileChange}
                    />
                    <div className="text-sm text-gray-500 mb-2">
                      <Label>{t("Click icon to change")}</Label>
                    </div>
                    {cropperOpen && avatarFile && (
                      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
                        <DialogContent className="min-w-2xl w-full">
                          <ImageCropper file={avatarFile} onCrop={handleAvatarCrop} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storeName">{t("Store Name")}</Label>
                    <Input
                      id="storeName"
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      placeholder={t("e.g. Shah Electronics")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storeDescription">{t("Store Description")}</Label>
                    <textarea
                      className="border rounded px-2 py-1 w-full resize-none"
                      id="storeDescription"
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      required
                      placeholder={t("Describe your store")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="contactPhone">{t("Store Contact Phone")}</Label>
                    <Input
                      id="storePhone"
                      type="tel"
                      value={storeContactPhone}
                      onChange={(e) => setStoreContactPhone(e.target.value)}
                      required
                      placeholder={t("e.g. +994501234567")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="storeEmail">{t("Store Email")}</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeContactEmail}
                      onChange={(e) => setStoreContactEmail(e.target.value)}
                      required
                      placeholder={t("e.g. info@shah.com")}
                    />
                  </div>

                </div>
                <div className="flex flex-col gap-6">
                  <h1 className="border-b pb-2">
                    {t("Tax & Address Information")}
                  </h1>
                  <div className="grid gap-3">
                    <Label htmlFor="taxIdType">{t("Tax ID Type")}</Label>
                    <select
                      id="taxIdType"
                      value={taxIdType}
                      onChange={e => setTaxIdType(Number(e.target.value))}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="" disabled>{t("Select tax ID type")}</option>
                      {taxIdTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="sellerTaxInfoId">{t("Seller Tax Info ID")}</Label>
                    <Input
                      id="sellerTaxInfoId"
                      type="text"
                      value={taxIdNumber}
                      onChange={(e) => setTaxIdNumber(e.target.value)}
                      required
                      placeholder={t("123456789")}
                    />
                  </div>
                  <h1 className="border-b pb-2">
                    {t("Address Information")}
                  </h1>
                  <div className="grid gap-3">
                    <Label htmlFor="addressStreet">{t("Street")}</Label>
                    <Input
                      id="addressStreet"
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                      placeholder={t("e.g. 123 Main St")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="addressCity">{t("City")}</Label>
                    <Input
                      id="addressCity"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder={t("e.g. Baku")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="addressState">{t("State")}</Label>
                    <Input
                      id="addressState"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder={t("e.g. Absheron")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="addressPostalCode">{t("Postal Code")}</Label>
                    <Input
                      id="addressPostalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      placeholder={t("e.g. AZ1000")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="addressCountry">{t("Country")}</Label>
                    <select
                      id="addressCountry"
                      value={storeCountryCode}
                      onChange={e => setStoreCountryCode(Number(e.target.value))}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="" disabled>{t("Select country")}</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="categoryId">{t("Category")}</Label>
                    <select
                      id="categoryId"
                      value={categoryId ?? "null"}
                      onChange={e => setCategoryId(e.target.value === "null" ? null : e.target.value)}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="null">{t("Select category")}</option>
                      {categories.filter(cat => cat.id !== null).map((cat) => (
                        <option key={cat.id} value={cat.id!}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="md:w-1/2 w-full"
                  onClick={() => setStep(1)}
                >
                  {t("Back")}
                </Button>
                <Button
                  type="submit"
                  className="md:w-1/2 w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
                >
                  {t("Register")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t("By clicking continue, you agree to our")} {" "}
        <a href="#">{t("Terms of Service")}</a> {t("and")} {" "}
        <a href="#">{t("Privacy Policy")}</a>.
      </div>
    </div>
  )
}
