import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext, useEffect, useState } from "react"
import ImageCropper from "@/components/ui/image-crop"
import { toast } from "sonner"
import { Eye, EyeOff, FileText, Mail, PhoneCall, UserRound } from "lucide-react"
import { Dialog, DialogContent } from "../ui/dialog"
import { MdAccountCircle } from "react-icons/md"
import type { RegisterRequest } from "@/features/account/DTOs/account.interfaces"
import { register } from "@/features/account/services/profile.service"
import { useNavigate } from "react-router-dom"
import { uploadImage } from "@/shared/utils/imagePost"; // Use your actual image upload function
import { getCountries } from "@/features/profile/Country/country.service";
import { getTaxes } from "@/features/profile/Tax/tax.service";
import { getCategories } from "@/features/profile/Category/category.service";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";
import Spinner from "@/components/custom/spinner";

// Category and Tax ID Type lists (same as profile)
export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [isloading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    async function fetchCountries() {
      try {
        const result:any = await getCountries();
        setCountries(result.data || []); // Always set as array
      } catch (error) {
        setCountries([]); // fallback to empty array on error
      }
    }
    async function fetchTaxes() {
      try {
        const result:any = await getTaxes();
        setTaxes(result.data || []); // Always set as array
      } catch (error) {
        setTaxes([]); // fallback to empty array on error
      }
    }

    async function fetchCategories() {
      try {
        const result:any = await getCategories();
        setCategories(result || []); // Always set as array
      } catch (error) {
        setCategories([]); // fallback to empty array on error
      }
    }

    fetchCountries();
    fetchTaxes();
    fetchCategories();
    setLoading(false);
  }, []);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent registration if logo is not uploaded
    if (!avatarFile) {
      toast.error('Please upload your store logo before registering.');
      return;
    }
    setLoading(true);
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
      let imageName = "";
      if (avatarFile) {
        imageName = await uploadImage(avatarFile);
        console.log("Uploaded image:", imageName);
      }
      user.StoreLogo = imageName;
      console.log("Registering user with image URL:", user);
      const result: any = await register(user);
      if (!result || !result.isSuccess) {
        toast.error(result.message || result.message || ('Registration failed. Please check your details.'));
        console.error("Registration error:", result);
        setLoading(false);
        return;
      }
      toast.success(('Registration successful!'));
      await login({ email, password });
      toast.success(('Logged in successfully!'));
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
        toast.error(('Registration failed. Please try again.'));
        console.error("Registration error:", error);
      }
    }
    setLoading(false);
  };
  const [step, setStep] = useState(1);
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname || !name || !passport || !email || !password || !confirmPassword) {
      toast.error(('Please fill in all fields.'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(('Passwords do not match.'));
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
    <>
      {isloading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </div>
      )}
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
                    alt={("Company Logo")}
                  />
                </div>
              </a>
              <h1 className="text-xl font-bold">{("Welcome to Shah.")}</h1>
              <div className="text-center text-sm">
                {("Already have an account?")} {" "}
                <a href="/login" className="underline underline-offset-4">
                  {("Sign in")}
                </a>
              </div>
            </div>
            {step === 1 ? (
              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                <h1 className="border-b pb-2">Enter Personal Details</h1>
                <div className="grid gap-3">
                  <Label htmlFor="name">{("Name")}</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={("John")}
                    />
                    <UserRound className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />

                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="surname">{("Surname")}</Label>
                  <div className="relative">
                    <Input
                      id="surname"
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                      placeholder={("Doe")}
                    />
                    <UserRound className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">{("Email")}</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={("m@example.com")}
                      required
                    />
                    <Mail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="phone">{("Phone")}</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={("055 555 55 55")}
                      required
                    />
                    <PhoneCall className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="countryCode">{("Country")}</Label>
                  <select
                    value={countryCitizenship || ""}
                    onChange={e => setCountryCitizenship(e.target.value)}
                    required
                    className="border rounded px-2 py-1"
                  >
                    <option value="">{("Select country")}</option>
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
                  <Label htmlFor="idPassport">{("ID/Passport")}</Label>
                  <div className="relative">
                    <Input
                      id="idPassport"
                      type="text"
                      value={passport}
                      onChange={(e) => setPassport(e.target.value)}
                      required
                      placeholder={("AB1234567")}
                    />
                    <FileText className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">{("Password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={("*********")}
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
                  <Label htmlFor="confirmPassword">{("Confirm Password")}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={("*********")}
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
                  {("Next")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 max-w-2xl mx-auto w-full">
                <div className="grid grid-cols-1 gap-8 w-full">
                  <div className="flex flex-col gap-6 justify-center">
                    <h1 className="border-b pb-2">{("Store Information")}</h1>
                    <div className="flex flex-col items-center mb-6">
                      <span
                        className="w-24 h-24 rounded-full border mb-2 flex items-center justify-center bg-gray-100 text-gray-400"
                        style={{ cursor: 'pointer', fontSize: '96px' }}
                        onClick={() => setCropperOpen(true)}
                      >
                        {avatar ? (
                          <img src={avatar} alt={("Avatar")} className="w-24 h-24 rounded-full object-cover" />
                        ) : (
                          <MdAccountCircle />
                        )}
                      </span>
                      <div className="text-sm text-gray-500 mb-2">
                        <Label>{("Click icon to change")}</Label>
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
                      <Label htmlFor="storeName">{("Store Name")}</Label>
                      <div className="relative">
                        <Input
                          id="storeName"
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          required
                          placeholder={("e.g. Shah Electronics")}
                          className="pr-8"
                        />
                        <UserRound className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="storeDescription">{("Store Description")}</Label>
                      <div className="relative">
                        <textarea
                          className="border rounded px-2 py-1 w-full resize-none pr-8"
                          id="storeDescription"
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          required
                          placeholder={("Describe your store")}
                        />
                        <FileText className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="contactPhone">{("Store Contact Phone")}</Label>
                      <div className="relative">
                        <Input
                          id="storePhone"
                          type="tel"
                          value={storeContactPhone}
                          onChange={(e) => setStoreContactPhone(e.target.value)}
                          required
                          placeholder={("e.g. +994501234567")}
                          className="pr-8"
                        />
                        <PhoneCall className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="storeEmail">{("Store Email")}</Label>
                      <div className="relative">
                        <Input
                          id="storeEmail"
                          type="email"
                          value={storeContactEmail}
                          onChange={(e) => setStoreContactEmail(e.target.value)}
                          required
                          placeholder={("e.g. info@shah.com")}
                          className="pr-8"
                        />
                        <Mail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                  </div>
                  <div className="flex flex-col gap-6">
                    <h1 className="border-b pb-2">
                      {("Tax & Address Information")}
                    </h1>
                    <div className="grid gap-3">
                      <Label htmlFor="taxIdType">{("Tax ID Type")}</Label>
                      <select
                        id="taxIdType"
                        value={taxIdType}
                        onChange={e => setTaxIdType(e.target.value)}
                        required
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="" disabled>{("Select tax ID type")}</option>
                        {taxes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="sellerTaxInfoId">{("Seller Tax Info ID")}</Label>
                      <div className="relative">
                        <Input
                          id="sellerTaxInfoId"
                          type="text"
                          value={taxIdNumber}
                          onChange={handleTaxIdNumberChange}
                          required
                          placeholder={("123456789")}
                          className="pr-8"
                        />
                        <FileText className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                      {taxIdNumberError && (
                        <div className="text-red-500 text-xs mt-1">{taxIdNumberError}</div>
                      )}
                    </div>
                    <h1 className="border-b pb-2">
                      {("Address Information")}
                    </h1>
                    <div className="grid gap-3">
                      <Label htmlFor="addressStreet">{("Street")}</Label>
                      <div className="relative">
                        <Input
                          id="addressStreet"
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          required
                          placeholder={("e.g. 123 Main St")}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="addressCity">{("City")}</Label>
                      <div className="relative">
                        <Input
                          id="addressCity"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          placeholder={("e.g. Baku")}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="addressState">{("State")}</Label>
                      <div className="relative">
                        <Input
                          id="addressState"
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          placeholder={("e.g. Absheron")}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="addressPostalCode">{("Postal Code")}</Label>
                      <div className="relative">
                        <Input
                          id="addressPostalCode"
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          placeholder={("e.g. AZ1000")}
                          className="pr-8"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="countryCode">{("Address Country")}</Label>
                      <select
                        value={storeCountryCode || ""}
                        onChange={e => setStoreCountryCode(e.target.value)}
                        required
                        className="border rounded px-2 py-1"
                      >
                        <option value="">{("Select country")}</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.id.toString()}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {storeCountryCode && countries.find(c => c.id.toString() === storeCountryCode) && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img
                            src={`https://flagsapi.com/${countries.find(c => c.id.toString() === storeCountryCode)?.code}/flat/32.png`}
                            alt={countries.find(c => c.id.toString() === storeCountryCode)?.code}
                            style={{ width: 32, height: 22 }}
                          />
                          <span style={{ fontSize: 16 }}>{countries.find(c => c.id.toString() === storeCountryCode)?.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="categoryId">{("Select the primary category of products")}</Label>
                      <select
                        id="categoryId"
                        value={categoryId ?? ""}
                        onChange={e => setCategoryId(e.target.value)}
                        required
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">{("Select category")}</option>
                        {categories.map((cat:any) => (
                          <option key={cat.id || cat.categoryName} value={cat.id || cat.categoryName}>{cat.categoryName}</option>
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
                    {("Back")}
                  </Button>
                  <Button
                    type="submit"
                    className="md:w-1/2 w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
                  >
                    {("Register")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {("By clicking continue, you agree to our")} {" "}
          <a href="#">{("Terms of Service")}</a> {("and")} {" "}
          <a href="#">{("Privacy Policy")}</a>.
        </div>
      </div>
    </>

  )
}
