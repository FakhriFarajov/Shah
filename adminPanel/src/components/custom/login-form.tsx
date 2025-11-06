import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useContext } from "react";
import { AuthContext } from "@/features/auth/contexts/AuthProvider";


export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const navigator = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading, isAuthenticated } = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await login({ email, password })
    if (result.success) {
      toast.success(t('Successfully logged in'))
      console.log(isAuthenticated);
      navigator("/home")
      console.log(isAuthenticated);
    } else {
      toast.error(t('Password or email is incorrect or the account does not exist'))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-6 rounded-lg max-w-xl mt-10">
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
            <h1 className="text-xl font-bold">{t('Welcome to Shah.')}</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">{t('Email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('m@example.com')}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">{t('Password')}</Label>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : t('Login')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
