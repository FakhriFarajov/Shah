import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { register } from "@/features/account/services/register.service";
import type { RegisterRequest } from "@/features/account/DTOs/account.interfaces";
import { getCountries } from "@/features/profile/Country/country.service";
import { useContext } from "react";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import  Spinner  from "@/components/custom/Spinner";

export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [countries, setCountries] = useState<{ id: number; name: string; code: string }[]>([]);
  const navigator = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    async function fetchCountries() {
      try {
        console.log("Fetching countries...");
        const result = await getCountries();
        console.log("Fetched countries:", result);
        setCountries(result.data || []); // Always set as array
      } catch (error) {
        setCountries([]); // fallback to empty array on error
      }
    }
    fetchCountries();
    setLoading(false);
  }, []);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user: RegisterRequest = {
      name,
      surname,
      email,
      phone,
      countryCitizenshipId: Number(countryCode), // Ensure number type
      password,
      confirmPassword
    };
    try {
      const result = await register(user);
      if (!result || !result.isSuccess) {
        toast.error(result.message || t('Registration failed. Please check your details.'));
        console.error("Registration error:", result);
        return;
      }
      toast.success(t('Registration successful!'));
      try {
        var loginResult = await login({ email, password });
        if (loginResult.success) {
          toast.success(t('Logged in successfully!'));
          navigator('/main');
        } else {
          toast.error(t('Login after registration failed. Please login manually.'));
          navigator('/login');
        }
      } catch (loginError) {
        toast.error(t('Login after registration failed. Please login manually.'));
        navigator('/login');
      }
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
    finally {
    setLoading(false);

    }
    console.log("Registering user:", user);
  };

  return (
    <>
      {
        loading && (
          <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
              <Spinner />
          </div>
        )
      }
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <form onSubmit={handleRegister}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="/main"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex w-50 h-30 items-center justify-center rounded-md">
                  <img
                    src="\src\assets\images\ShahLogo2.png"
                    className="w-50 h-50"
                    alt={t("Company Logo")}
                  />
                </div>
              </a>
              <h1 className="text-xl font-bold">{t("Welcome to Shah.")}</h1>
              <div className="text-center text-sm">
                {t("Already have an account?")}{" "}
                <a href="/login" className="underline underline-offset-4">
                  {t("Sign in")}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">{t("Name")}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John"
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
                  placeholder="Doe"
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
                  required
                  placeholder="012 345 67 89"

                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="countryCode">{t("Country")}</Label>
                <select
                  value={countryCode || ""}
                  onChange={e => setCountryCode(e.target.value)}
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
                {countryCode && countries.find(c => c.id.toString() === countryCode) && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={`https://flagsapi.com/${countries.find(c => c.id.toString() === countryCode)?.code}/flat/32.png`}
                      alt={countries.find(c => c.id.toString() === countryCode)?.code}
                      style={{ width: 32, height: 22 }}
                    />
                    <span style={{ fontSize: 16 }}>{countries.find(c => c.id.toString() === countryCode)?.name}</span>
                  </div>
                )}
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
                    placeholder="********"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" /></svg>
                    )}
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
                    placeholder="********"
                  />
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
              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
              >
                {t("Register")}
              </Button>
            </div>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-background text-muted-foreground relative z-10 px-2">
                {t("Or")}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <Button variant="outline" type="button" className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                {t("Continue with Google")}
              </Button>
            </div>
          </div>
        </form>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {t("By clicking continue, you agree to our")}{" "}
          <a href="#">{t("Terms of Service")}</a> {t("and")}{" "}
          <a href="#">{t("Privacy Policy")}</a>.
        </div>
      </div>
    </>
  )
}
