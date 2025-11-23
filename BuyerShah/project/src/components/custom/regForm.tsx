import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import { register } from "@/features/account/services/register.service";
import type { RegisterRequest } from "@/features/account/DTOs/account.interfaces";
import { getCountries } from "@/features/services/Country/country.service";
import { useContext } from "react";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Spinner from "@/components/custom/spinner";
import { Mail, Phone, UserRound } from "lucide-react"

export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        const result = await getCountries();
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
        toast.error(result.message || ('Registration failed. Please check your details.'));
        return;
      }
      toast.success(('Registration successful!'));
      try {
        var loginResult = await login({ email, password });
        if (loginResult.success) {
          toast.success(('Logged in successfully!'));
          navigator('/main');
        } else {
          toast.error('Login after registration failed. Please login manually.');
          navigator('/login');
        }
      } catch (loginError) {
        toast.error('Login after registration failed. Please login manually.');
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
      } else {
        toast.error(('Registration failed. Please try again.'));
      }
    }
    finally {
      setLoading(false);

    }
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
                    alt={("Company Logo")}
                  />
                </div>
              </a>
              <h1 className="text-xl font-bold">{("Welcome to Shah.")}</h1>
              <div className="text-center text-sm">
                {("Already have an account?")}{" "}
                <a href="/login" className="underline underline-offset-4">
                  {("Sign in")}
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">{("Name")}</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John"
                  />
                  <Mail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
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
                    placeholder="Doe"
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
                    required
                    placeholder="0123456789"
                  />
                  <Phone className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="countryCode">{("Country")}</Label>
                <select
                  value={countryCode || ""}
                  onChange={e => setCountryCode(e.target.value)}
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
                <Label htmlFor="password">{("Password")}</Label>
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
                    aria-label={showPassword ? ("Hide password") : ("Show password")}
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
                <Label htmlFor="confirmPassword">{("Confirm Password")}</Label>
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
                    aria-label={showConfirmPassword ? ("Hide password") : ("Show password")}
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
                {("Register")}
              </Button>
            </div>
          </div>
        </form>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {("By clicking continue, you agree to our")}{" "}
          <a href="#">{("Terms of Service")}</a> {("and")}{" "}
          <a href="#">{("Privacy Policy")}</a>.
        </div>
      </div>
    </>
  )
}
