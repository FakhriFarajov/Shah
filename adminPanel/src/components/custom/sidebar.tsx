
import { getAdminProfile } from "@/features/profile/AdminService/admin.service";
import { tokenStorage } from "@/shared";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { IconCategory } from "@tabler/icons-react";
import { User, ListOrdered, Home, Warehouse, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";


export function AppSidebar() {
    const [adminName, setAdminName] = useState<string | null>(null);
    
    async function fetchAdminProfile(adminId: string) {
        var result = await apiCallWithManualRefresh(() => getAdminProfile(adminId));
        console.log("Fetch Admin Profile Result:", result);
        return result;
    }

    useEffect(() => {
        const fetchProfile = async () => {
            let adminId = "";
            try {
                const token = tokenStorage.get();
                if (token) {
                    const decoded = decodeUserFromToken(token);
                    adminId = decoded?.admin_profile_id || "";
                }
            } catch {
                toast.error("Failed to decode token");
            }

            var result = await fetchAdminProfile(adminId);
            if (result) {
                setAdminName(result.name);
            } else {
                toast.error("Failed to fetch admin profile");
            }
        };
        fetchProfile();
    }, []);
    const { t } = useTranslation();
    const navigator = useNavigate();

    const sidebarItems = [
        { icon: <Home className="w-5 h-5 mr-2" />, label: t("Home") },
        { icon: <IconCategory className="w-5 h-5 mr-2" />, label: t("Categories") },
        { icon: <User className="w-5 h-5 mr-2" />, label: t("Buyers") },
        { icon: <User className="w-5 h-5 mr-2" />, label: t("Sellers") },
        { icon: <User className="w-5 h-5 mr-2" />, label: t("Admins") },
        { icon: <ListOrdered className="w-5 h-5 mr-2" />, label: t("Orders") },
        { icon: <Package className="w-5 h-5 mr-2" />, label: t("Products") },
        { icon: <Warehouse className="w-5 h-5 mr-2" />, label: t("Warehouses") },
    ];
    return (
        <aside className="w-64 bg-white border-r flex flex-col items-center py-8 px-4">
            <div className="font-semibold text-lg mb-2">{t("Admin Dashboard")}</div>
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
