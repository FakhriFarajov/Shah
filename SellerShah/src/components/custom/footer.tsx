import { Separator } from "@/components/ui/separator";
import { Label } from "@radix-ui/react-label";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { GooglePlayButton , AppStoreButton } from "react-mobile-app-button";

export default function Footer() {

    return (
        <footer className="w-full bg-muted p-6 md:p-12 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                    <Label className="font-bold mb-2">{("Shah")}</Label>
                    <ul className="space-y-1">
                        <li>{("About Us")}</li>
                        <li>{("Careers")}</li>
                        <li>{("Contact")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{("Campaigns")}</Label>
                    <ul className="space-y-1">
                        <li>{("Corporate")}</li>
                        <li>{("Campaigns")}</li>
                        <li>{("Influencer")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{("Merchant")}</Label>
                    <ul className="space-y-1">
                        <li>{("Become a Merchant")}</li>
                        <li>{("Merchant Dashboard")}</li>
                        <li>{("Merchant Support")}</li>
                    </ul>
                </div>
                <div>
                    <Label className="font-bold mb-2">{("Help")}</Label>
                    <ul className="space-y-1">
                        <li>{("FAQ")}</li>
                        <li>{("Support Center")}</li>
                        <li>{("Contact Us")}</li>
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

                <div className="flex flex-col md:flex-row gap-2">
                    <GooglePlayButton
                        url="https://play.google.com/store/apps/details?id=com.example.app"
                        theme={"light"}
                        className={"custom-style text-xs"}
                        width={235}
                        height={70}
                    />
                    <AppStoreButton
                        url="https://apps.apple.com/app/id123456789"
                        theme={"light"}
                        className={"custom-style"}
                        width={235}
                        height={70}
                    />

                </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-xs">
                ©2025 DSM Group Communication and Sales Inc. {("All Rights Reserved")}
            </div>
        </footer>
    );
}
