
import { User, ShoppingBag, ListOrdered, Home, Warehouse, List, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";


export function AppSidebar() {
    const { t } = useTranslation();
    const navigator = useNavigate();
    const sidebarItems = [
        { icon: <Home className="w-5 h-5 mr-2" />, label: t("Home") },
        { icon: <User className="w-5 h-5 mr-2" />, label: t("Buyers") },
        { icon: <ShoppingBag className="w-5 h-5 mr-2" />, label: t("Sellers") },
        { icon: <ListOrdered className="w-5 h-5 mr-2" />, label: t("Orders") },
        { icon: <Package className="w-5 h-5 mr-2" />, label: t("Products") },
        { icon: <Warehouse className="w-5 h-5 mr-2" />, label: t("Warehouse") },
    ];
    return (
        <aside className="w-64 bg-white border-r flex flex-col items-center py-8 px-4">
            <div className="font-semibold text-lg mb-8">{t("Admin Panel")}</div>
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
