import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHome, FaMale, FaFemale, FaChild, FaMobileAlt, FaBook, FaHeart, FaBasketballBall, FaPuzzlePiece, FaCouch, FaMedkit, FaCar } from "react-icons/fa";

const categoryIcons: Record<string, JSX.Element> = {
    home: <FaHome className="text-blue-500" />,
    man: <FaMale className="text-green-500" />,
    woman: <FaFemale className="text-pink-500" />,
    kids: <FaChild className="text-yellow-500" />,
    electronics: <FaMobileAlt className="text-gray-500" />,
    books: <FaBook className="text-purple-500" />,
    beauty: <FaHeart className="text-red-500" />,
    sports: <FaBasketballBall className="text-orange-500" />,
    toys: <FaPuzzlePiece className="text-indigo-500" />,
    home_kitchen: <FaCouch className="text-teal-500" />,
    health: <FaMedkit className="text-lime-500" />,
    automotive: <FaCar className="text-blue-700" />,
};

const categoryBg: Record<string, string> = {
    home: "bg-blue-50",
    man: "bg-green-50",
    woman: "bg-pink-50",
    kids: "bg-yellow-50",
    electronics: "bg-gray-50",
    books: "bg-purple-50",
    beauty: "bg-red-50",
    sports: "bg-orange-50",
    toys: "bg-indigo-50",
    home_kitchen: "bg-teal-50",
    health: "bg-lime-50",
    automotive: "bg-blue-100",
};

export default function ProductGrid() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full">
            {/* {Object.entries(categories).map(([key, category]: [string, any]) => (
                <div
                    key={key}
                    className={`flex flex-col items-center justify-center rounded-xl shadow-md p-6 cursor-pointer transition hover:scale-105 ${categoryBg[key] || "bg-white"}`}
                    onClick={() => navigate(`/category/${key}`)}
                >
                    <div className="mb-2 text-3xl">{categoryIcons[key] || <FaHome className="text-gray-400" />}</div>
                    <Badge className="text-base font-semibold px-4 py-2 bg-white border border-gray-300 text-gray-800 shadow">
                        {t(category.name)}
                    </Badge>
                </div>
            ))} */}
        </div>
    );
}