import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

// Category and Tax ID Type lists (same as profile)
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

export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation()
  // Step 1 fields
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [taxIdType, setTaxIdType] = useState(taxIdTypes[0].id);
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [idPassport, setIdPassport] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields (SellerProfile & Address)
  const [phone, setPhone] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeLogoPreview, setStoreLogoPreview] = useState<string>("");
  const [sellerTaxInfoId, setSellerTaxInfoId] = useState("");
  // Address fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressCountry, setAddressCountry] = useState("");

  const [step, setStep] = useState(1);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname || !name || !idPassport || !email || !password || !confirmPassword) {
      toast.error(t('Please fill in all fields.'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('Passwords do not match.'));
      return;
    }
    setStep(2);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !storeName || !storeDescription || !contactPhone || !sellerTaxInfoId || !street || !city || !state || !postalCode || !addressCountry || !categoryId || !taxIdType) {
      toast.error(t('Please fill in all fields.'));
      return;
    }
    // Save user to localStorage as an object with all fields
    const user = {
      surname,
      name,
      idPassport,
      email,
      password,
      phone,
      sellerProfile: {
        storeName,
        storeDescription,
        storeLogoUrl,
        contactEmail: email,
        contactPhone,
        sellerTaxInfoId,
        categoryId,
        taxIdType,
        address: {
          street,
          city,
          state,
          postalCode,
          country: addressCountry
        }
      }
    };
    localStorage.setItem("user", JSON.stringify(user));
    toast.success(t('Registration successful!'));
    window.location.href = "/profile"; // Redirect to profile or main page
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-4xl mx-auto", className)} {...props}>
      <form onSubmit={step === 1 ? handleNext : handleRegister}>
        <div className="flex flex-col gap-6 ">
          <div className="flex flex-col items-center gap-2">
            <a
              href="/main"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex w-50 h-30 items-center justify-center rounded-md">
                <img
                  src="/src/assets/images/ShahLogo2.png"
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
                  placeholder={t("+1 (555) 123-4567")}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="idPassport">{t("ID/Passport")}</Label>
                <Input
                  id="idPassport"
                  type="text"
                  value={idPassport}
                  onChange={(e) => setIdPassport(e.target.value)}
                  required
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
                <div className="flex flex-col gap-6">
                  <h1 className="border-b pb-2">{t("Store Information")}</h1>
                  <div className="flex flex-col items-center gap-3 pb-2">
                    <Label>{t("Store Logo")}</Label>
                    <div className="w-28 h-28 rounded-lg border flex items-center justify-center bg-gray-50 mb-2 shadow">
                      <img
                        src={storeLogoPreview || storeLogoUrl || "/src/assets/images/ShahLogo2.png"}
                        alt="Store Logo Preview"
                        className="w-24 h-24 object-cover rounded"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      id="store-logo-upload"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setStoreLogoPreview(reader.result as string);
                            setStoreLogoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => document.getElementById('store-logo-upload')?.click()}>
                      {t("Upload Logo")}
                    </Button>
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
                      className="border rounded px-2 py-1 w-full"
                      id="storeDescription"
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      required
                      placeholder={t("Describe your store")}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="contactPhone">{t("Contact Phone")}</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      placeholder={t("e.g. +994501234567")}
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
                      onChange={e => setTaxIdType(e.target.value)}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="" disabled>{t("Select tax ID type")}</option>
                      {taxIdTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="sellerTaxInfoId">{t("Seller Tax Info ID")}</Label>
                    <Input
                      id="sellerTaxInfoId"
                      type="text"
                      value={sellerTaxInfoId}
                      onChange={(e) => setSellerTaxInfoId(e.target.value)}
                      required
                      placeholder={t("123456789")}
                    />
                  </div>
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
                      value={addressCountry}
                      onChange={e => setAddressCountry(e.target.value)}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="" disabled>{t("Select country")}</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="categoryId">{t("Category")}</Label>
                    <select
                      id="categoryId"
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
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
