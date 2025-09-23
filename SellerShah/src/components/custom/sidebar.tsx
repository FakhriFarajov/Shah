
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ShoppingBag, ListOrdered, Settings, Flag, MessageCircleCode, Home, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


export function AppSidebar() {
    const { t } = useTranslation();
    const navigator = useNavigate();
    const sidebarItems = [
        { icon: <Home className="w-5 h-5 mr-2" />, label: t("Home") },
        { icon: <User className="w-5 h-5 mr-2" />, label: t("Profile") },
        { icon: <ShoppingBag className="w-5 h-5 mr-2" />, label: t("Products") },
        { icon: <ListOrdered className="w-5 h-5 mr-2" />, label: t("Orders") },
        { icon: <MessageCircleCode className="w-5 h-5 mr-2" />, label: t("Reviews") },
        { icon: <Flag className="w-5 h-5 mr-2" />, label: t("Report") },
    ];
    return (
        <aside className="w-64 bg-white border-r flex flex-col items-center py-8 px-4">
            <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={"/src/assets/images/ShahLogo2.png"} alt="Navigate to Interface" onClick={() => navigator('/home')} className="cursor-pointer" />
                <AvatarFallback>SS</AvatarFallback>
            </Avatar>
            <div className="font-semibold text-lg mb-8">{t("Seller Name")}</div>
            <nav className="w-full flex flex-col gap-2">
                {sidebarItems.map((item, idx) => (
                    <button
                        key={idx}
                        className="flex items-center w-full px-4 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                        onClick={() => navigator(`/${item.label.toLowerCase()}`)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    )
}
