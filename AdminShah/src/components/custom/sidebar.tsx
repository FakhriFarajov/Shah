import { IconCategory } from "@tabler/icons-react";
import { User, ListOrdered, Home, Warehouse, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";


export function AppSidebar() {
    const navigator = useNavigate();

    const sidebarItems = [
        { icon: <Home className="w-5 h-5 mr-2" />, label: ("Home") },
        { icon: <IconCategory className="w-5 h-5 mr-2" />, label: ("Categories") },
        { icon: <User className="w-5 h-5 mr-2" />, label: ("Buyers") },
        { icon: <User className="w-5 h-5 mr-2" />, label: ("Sellers") },
        { icon: <User className="w-5 h-5 mr-2" />, label: ("Admins") },
        { icon: <ListOrdered className="w-5 h-5 mr-2" />, label: ("Orders") },
        { icon: <Package className="w-5 h-5 mr-2" />, label: ("Products") },
        { icon: <Warehouse className="w-5 h-5 mr-2" />, label: ("Warehouses") },
    ];
    return (
        <aside className="w-64 bg-white border-r flex flex-col items-center py-8 px-4">
            <div className="font-semibold text-lg mb-7">{("Admin Dashboard")}</div>
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
