import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@radix-ui/react-label";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg p-6 md:p-12 text-sm text-muted-foreground ">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                    <Label className="font-bold mb-2">{t("Shah")}</Label>
                    <ul className="space-y-1">
                        <li>{t("About Us")}</li>
                        <li>{t("Careers")}</li>
                        <li>{t("Contact")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{t("Campaigns")}</Label>
                    <ul className="space-y-1">
                        <li>{t("About Us")}</li>
                        <li>{t("Careers")}</li>
                        <li>{t("Contact")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{t("Merchant")}</Label>
                    <ul className="space-y-1">
                        <li>{t("About Us")}</li>
                        <li>{t("Careers")}</li>
                        <li>{t("Contact")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{t("Help")}</Label>
                    <ul className="space-y-1">
                        <li>{t("About Us")}</li>
                        <li>{t("Careers")}</li>
                        <li>{t("Contact")}</li>
                    </ul>
                </div>
                {/* Repeat for other sections like Campaigns, Seller Zone, Help */}
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                    <Facebook className="w-5 h-5" />
                    <Instagram className="w-5 h-5" />
                    <Youtube className="w-5 h-5" />
                    <Twitter className="w-5 h-5" />
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">{t("App Store")}</Button>
                    <Button variant="outline">{t("Google Play")}</Button>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-xs">
                ©2025 DSM Group Communication and Sales Inc. {t("All Rights Reserved")}
            </div>
        </footer>
    );
}