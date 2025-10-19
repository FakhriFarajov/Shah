import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext, useEffect, useState } from "react"
import ImageCropper from "@/components/ui/image-crop"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent } from "../ui/dialog"
import { MdAccountCircle } from "react-icons/md"
import type { RegisterRequest } from "@/features/account/DTOs/account.interfaces"
import { register } from "@/features/account/services/profile.service"
import { useNavigate } from "react-router-dom"
import { uploadProfileImage } from "@/shared/utils/imagePost"; // Use your actual image upload function
import { getCountries } from "@/features/profile/Country/country.service";
import { getTaxes } from "@/features/profile/Tax/tax.service";
import { getCategories } from "@/features/profile/Category/category.service";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";




// Category and Tax ID Type lists (same as profile)
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
  const [countryCitizenship, setCountryCitizenship] = useState("");
  const [passport, setPassport] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Step 2 fields
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeContactPhone, setStoreContactPhone] = useState("");
  const [storeContactEmail, setStoreContactEmail] = useState("");
  const [storeCountryCode, setStoreCountryCode] = useState("");
  const [taxIdType, setTaxIdType] = useState("");
  const [taxIdNumber, setTaxIdNumber] = useState("");
  const [taxIdNumberError, setTaxIdNumberError] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [categoryId, setCategoryId] = useState<null | string>(null);
  const [storeLogoPreview] = useState<string>("");
  const [cropperOpen, setCropperOpen] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [taxes, setTaxes] = useState<Array<{ id: number; name: string; RegexPattern: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);



  const { login } = useContext(AuthContext);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const result = await getCountries();
        setCountries(result.data || []); // Always set as array
      } catch (error) {
        setCountries([]); // fallback to empty array on error
      }
    }
    async function fetchTaxes() {
      try {
        const result = await getTaxes();
        setTaxes(result.data || []); // Always set as array
      } catch (error) {
        setCountries([]); // fallback to empty array on error
      }
    }

    async function fetchCategories() {
      try {
        const result = await getCategories();
        setCategories(result|| []); // Always set as array
      } catch (error) {
        setCategories([]); // fallback to empty array on error
      }
    }

    fetchCountries();
    fetchTaxes();
    fetchCategories();

  }, []);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const user: RegisterRequest = {
      Name: name,
      Surname: surname,
      Email: email,
      Phone: phone,
      Passport: passport,
      CountryCitizenshipId: Number(countryCitizenship), // or correct enum value
      Password: password,
      ConfirmPassword: confirmPassword,
      StoreName: storeName,
      StoreDescription: storeDescription,
      StoreContactEmail: storeContactEmail,
      StoreContactPhone: storeContactPhone,
      TaxId: Number(taxIdType), // or correct enum value
      TaxNumber: taxIdNumber,
      Street: street,
      City: city,
      State: state,
      PostalCode: postalCode,
      StoreCountryCodeId: Number(storeCountryCode), // or correct enum value
      CategoryId: categoryId === "null" ? null : categoryId
    };
    console.log("Registering user:", user);
    try {
      const imageName = await uploadProfileImage(avatarFile);
      user.StoreLogo = imageName;
      console.log("Registering user with image URL:", user);
      const result = await register(user);
      if (!result || !result.isSuccess) {
        toast.error(result.message || result.message || t('Registration failed. Please check your details.'));
        console.error("Registration error:", result);
        return;
      }
      toast.success(t('Registration successful!'));
      await login({ email, password });
      toast.success(t('Logged in successfully!'));
      navigator('/home');
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


  // Helper to get regex for selected tax type
  const getSelectedTaxRegex = () => {
    const selected = taxes.find(t => t.id === taxIdType);
    return selected?.RegexPattern || null;
  };

  const handleTaxIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTaxIdNumber(value);
    const regexStr = getSelectedTaxRegex();
    if (regexStr) {
      try {
        const regex = new RegExp(regexStr);
        if (!regex.test(value)) {
          toast.error(`Tax number must match: ${regexStr}`);
          setTaxIdNumberError("Invalid format for selected tax type");
        } else {
          setTaxIdNumberError(null);
        }
      } catch {
        setTaxIdNumberError(null); // fallback if regex is invalid
      }
    } else {
      setTaxIdNumberError(null);
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
              <div className="grid gap-3">
                <Label htmlFor="countryCode">{t("Country")}</Label>
                <select
                  value={countryCitizenship || ""}
                  onChange={e => setCountryCitizenship(e.target.value)}
                  required
                  className="border rounded px-2 py-1"
                >
                  <option value="">{t("Select country")}</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id.toString()}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {countryCitizenship && countries.find(c => c.id.toString() === countryCitizenship) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={`https://flagsapi.com/${countries.find(c => c.id.toString() === countryCitizenship)?.code}/flat/32.png`}
                      alt={countries.find(c => c.id.toString() === countryCitizenship)?.code}
                      style={{ width: 32, height: 22 }}
                    />
                    <span style={{ fontSize: 16 }}>{countries.find(c => c.id.toString() === countryCitizenship)?.name}</span>
                  </div>
                )}
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
                      onClick={setCropperOpen}
                    >
                      {avatar ? (
                        <img src={avatar} alt={t("Avatar")} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <MdAccountCircle />
                      )}
                    </span>
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
                      {taxes.map((type) => (
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
                      onChange={handleTaxIdNumberChange}
                      required
                      placeholder={t("123456789")}
                    />
                    {taxIdNumberError && (
                      <div className="text-red-500 text-xs mt-1">{taxIdNumberError}</div>
                    )}
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
                    <Label htmlFor="countryCode">{t("Address Country")}</Label>
                    <select
                      value={storeCountryCode || ""}
                      onChange={e => setStoreCountryCode(e.target.value)}
                      required
                      className="border rounded px-2 py-1"
                    >
                      <option value="">{t("Select country")}</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id.toString()}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {countryCitizenship && countries.find(c => c.id.toString() === countryCitizenship) && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={`https://flagsapi.com/${countries.find(c => c.id.toString() === countryCitizenship)?.code}/flat/32.png`}
                          alt={countries.find(c => c.id.toString() === countryCitizenship)?.code}
                          style={{ width: 32, height: 22 }}
                        />
                        <span style={{ fontSize: 16 }}>{countries.find(c => c.id.toString() === countryCitizenship)?.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="categoryId">{t("Category")}</Label>
                    <select
                      id="categoryId"
                      value={categoryId ?? ""}
                      onChange={e => setCategoryId(e.target.value)}
                      required
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">{t("Select category")}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
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
