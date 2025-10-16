import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/custom/Navbar/navbar";



export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
    <Navbar></Navbar>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <Card className="ring-1 ring-slate-200">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-50 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold">404 — Page not found</CardTitle>
                  <p className="text-sm text-slate-500">We couldn’t find the page you’re looking for.</p>
                </div>
              </div>
              <div className="hidden sm:flex gap-2">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go back
                </Button>
                <Link to="/">
                  <Button>Home</Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Uh-oh.</h3>
                <p className="mt-4 text-slate-600">The page may have been moved, removed, or you might have mistyped the URL.</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/">
                    <Button className="inline-flex items-center" aria-label="Go to homepage">
                      Home
                    </Button>
                  </Link>

                  <Button variant="outline" onClick={() => navigate(-1)} className="inline-flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go back
                  </Button>

                  <Link to="/contact">
                    <Button variant="ghost">Report an issue</Button>
                  </Link>
                </div>

                <p className="mt-6 text-xs text-slate-400">If you think this is an error, open a support ticket or check the URL.</p>
              </div>

              <div className="flex items-center justify-center">
                <svg
                  width="220"
                  height="160"
                  viewBox="0 0 220 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                  className="max-w-full"
                >
                  <rect x="3" y="3" width="214" height="154" rx="12" fill="#F8FAFC" stroke="#E6EEF8" />
                  <g transform="translate(22,22)">
                    <text x="0" y="40" fontSize="56" fontWeight="700" fill="#0F172A">404</text>
                    <text x="0" y="88" fontSize="12" fill="#64748B">Page not found</text>
                  </g>
                </svg>
              </div>
            </CardContent>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex justify-between items-center">
              <div className="text-xs text-slate-400">Made with ❤ — Shah Marketplace</div>
              <div className="flex gap-2 sm:hidden">
                <Link to="/">
                  <Button size="sm">Home</Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>

  );
}
