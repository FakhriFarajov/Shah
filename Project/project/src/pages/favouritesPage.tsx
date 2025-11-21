import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import ProductCard from "@/components/custom/itemCard";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getFavouritesByUserId } from "@/features/services/product/products.service";
import { toast } from "sonner";
import { getImage } from "@/shared/utils/imagePost";
import Spinner from "@/components/custom/spinner";


export default function FavouritesPage() {
    const [favourites, setFavourites] = useState<any[]>([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchFavourites() {
            try {
                setLoading(true);
                var res = await apiCallWithManualRefresh(() => getFavouritesByUserId());
                const items = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : (res?.data?.data || []);

                if (Array.isArray(items) && items.length > 0) {
                    await Promise.all(
                        items.map(async (element: any) => {
                            try {
                                if (element.mainImage) {
                                    const url = await getImage(element.mainImage);
                                    element.mainImage = url || "https://picsum.photos/seed/product1/400/400";
                                } else if (element.mainImage) {
                                    element.mainImage = element.mainImage;
                                } else {
                                    element.mainImage = "https://picsum.photos/seed/product1/400/400";
                                }
                            } catch (error) {
                                element.mainImage = null;
                            }
                        })
                    );
                }
                setFavourites(items);
                setLoading(false);
            }
            catch (error) {
                setLoading(false);
                if (error.response?.status == 401) {
                    toast.info("You have to login in order to view your favourites.");
                    navigate('/login');
                    return;
                }
            }
        }
        fetchFavourites();
    }, []);

    return (
        <>
            {
                loading && (
                    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center z-50">
                        <Spinner />
                    </div>
                )
            }
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favourites.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />

        </>
    );
}
