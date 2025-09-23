import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null")
    if (user && user.email === email && user.password === password) {
      localStorage.setItem("userToken", "demoToken")
      window.location.href = "/profile"
    } else {
      toast.error(t('Password or email is incorrect'))
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
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
            <h1 className="text-xl font-bold">{t('Welcome to Shah.')}</h1>
            <div className="text-center text-sm">
              {t("Don't have an account?")}{" "}
              <a href="/register" className="underline underline-offset-4">
                {t('Sign up')}
              </a>
            </div>
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white hover:text-gray-100"
            >
              {t('Login')}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {t('By clicking continue, you agree to our')} {" "}
        <a href="#">{t('Terms of Service')}</a> {t('and')} {" "}
        <a href="#">{t('Privacy Policy')}</a>.
      </div>
    </div>
  )
}
