import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function RegForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  // Step 1 fields
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 fields
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [tin, setTin] = useState("");

  const [step, setStep] = useState(1);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname || !name || !email || !password || !confirmPassword) {
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
    if (!phone || !bankAccount || !companyName || !website || !tin) {
      toast.error(t('Please fill in all fields.'));
      return;
    }
    // Save user to localStorage as an object with all fields
    const user = { surname, name, email, password, phone, bankAccount, companyName, website, tin };
    localStorage.setItem("userToken", "demoToken"); // You can use a real token or uuid
    localStorage.setItem("user", JSON.stringify(user));
    toast.success(t('Registration successful!'));
    window.location.href = "/profile"; // Redirect to profile or main page
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={step === 1 ? handleNext : handleRegister}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="/main"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex w-50 h-30 items-center justify-center rounded-md">
                <img
                  src="/src/assets/images/Gemini_Generated_Image_fym6k9fym6k9fym6-Photoroom.png"
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
            <div className="flex flex-col gap-6">
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
                <Label htmlFor="password">{t("Password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">{t("Confirm Password")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-800"
              >
                {t("Next")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="phone">{t("Phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="bankAccount">{t("Bank Account")}</Label>
                <Input
                  id="bankAccount"
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="companyName">{t("Company Name")}</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="website">{t("Website")}</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tin">{t("TIN")}</Label>
                <Input
                  id="tin"
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setStep(1)}
                >
                  {t("Back")}
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-800"
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
