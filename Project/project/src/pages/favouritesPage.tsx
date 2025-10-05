import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import ProductCard from "@/components/custom/itemCard";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackToTopButton from "@/components/custom/BackToTopButton";



export default function FavouritesPage() {
    const [favourites, setFavourites] = useState<any[]>([]);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const favs = localStorage.getItem("favourites");
        if (favs) {
            setFavourites(JSON.parse(favs));
        }
    }, []);

    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-6 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">{t('Your Likes')}</h1>
                {favourites.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="mx-auto" size={48} />
                        <h1 className="text-xl font-bold">{t('No favourites yet.')}</h1>
                        <Button className="py-2 px-4 rounded-lg" variant="outline" onClick={() => navigate('/main')}>
                            {t('Go shopping!')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                        {favourites.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <BackToTopButton />
            <Footer />

        </>
    );
}
