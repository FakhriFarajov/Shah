import NavBar from "@/components/custom/Navbar/navbar";
import Carousel from "@/components/custom/carousel";
import Footer from "@/components/custom/footer"
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/custom/itemCard";
import "../i18n"; // Import i18n configuration
import { useTranslation } from "react-i18next";
import Grid from "@/components/custom/ProductGrid";
import { useEffect, useState } from "react";
import { getRandomPaginated } from "@/features/profile/product/profile.service";
import { getProfileImage } from "@/shared/utils/imagePost";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";
import { tokenStorage } from "@/shared/tokenStorage";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import Spinner from "@/components/custom/Spinner";

// Type for subcategory filter

const slides = [
    "https://aimg.kwcdn.com/material-put/2079f6251c/cc20ce65-db4a-4d92-aeee-37122020bca6.png?imageView2/q/70/format/webp",
    "https://ir.ozone.ru/s3/cms/fb/ta5/wc1450/en-tur_desktop_2832x600_1.jpg",
    "https://ir.ozone.ru/s3/cms/c4/t38/wc1450/azengchina.jpg",
    "https://ir.ozone.ru/s3/cms/14/ta8/wc1450/2832x600.jpg"
]


export default function Main() {
    const { t } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(20);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
    const load = async () => {
            const tok: string | null = tokenStorage.get();
            const result = decodeUserFromToken(tok || "");
            console.log("Decoded user from token:", result);
            setLoading(true);
            try {
                const userId = (result?.buyer_profile_id || result?.id) ?? null;
                console.log("Fetching products for page:", currentPage, "with pageSize:", pageSize, "and userId:", userId);
                const fetched = await apiCallWithManualRefresh(() => getRandomPaginated(currentPage, pageSize, userId as any));
                const payload: any = (fetched as any)?.data ?? fetched;
                console.log("Fetched Products payload:", payload);

                // Support multiple API shapes: array directly, { data: [] }, { items: [] }, { data: { data: [] | items: [] } }
                const items: any[] = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : Array.isArray(payload?.items)
                            ? payload.items
                            : Array.isArray(payload?.data?.items)
                                ? payload.data.items
                                : Array.isArray(payload?.data?.data)
                                    ? payload.data.data
                                    : [];

                // Resolve images in parallel and attach `mainImageUrl` (or placeholder)
                if (Array.isArray(items) && items.length > 0) {
                    await Promise.all(
                        items.map(async (element: any) => {
                            try {
                                if (element.mainImage) {
                                    const url = await getProfileImage(element.mainImage);
                                    element.mainImage = url || element.mainImage || "https://via.placeholder.com/300x200";
                                } else {
                                    element.mainImage = "https://via.placeholder.com/300x200";
                                }
                            } catch (error) {
                                console.warn("Error resolving product image:", error);
                                element.mainImage = "https://via.placeholder.com/300x200";
                            }
                        })
                    );
                }

                // If API doesn't provide totals, fall back to infinite-scroll style: hasMore when we received a full page
                setHasMore(items.length >= pageSize);
                setProducts(prev => currentPage > 1 ? [...prev, ...items] : items);
            } catch (e) {
                console.error('Fetch failed', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentPage, pageSize]);


    return (
        <>
        {
            loading &&
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-100 z-50">
                <Spinner />
            </div>
        }
            <NavBar />
            {/* Show user logo and name at the top */}
            <div className="min-h-screen w-full bg-gray-100">
                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Carousel slides={slides} size={250} />
                </div>
                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Label className="text-2xl sm:text-4xl font-semibold mb-4 block text-center">{t('Featured Products')}</Label>
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {loading ? (
                            <div className="col-span-full text-center p-8">{t('Loading...')}</div>
                        ) : products.length === 0 ? (
                            <div className="col-span-full text-center p-8 text-gray-600">{t('No products found')}</div>
                        ) : (
                            products.map((product: any) => (
                                <ProductCard key={product.id || product.representativeVariantId} product={product} />
                            ))
                        )}
                    </div>
                    {/* Pagination controls */}
                    <div className="mt-6 text-center">
                        {/* See More button - loads next page and appends results */}
                        <button
                            className="inline-flex items-center px-32 py-4 bg-indigo-600 text-white text-2xl rounded-4xl disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={loading || !hasMore}
                        >
                            {loading ? t('Loading...') : (!hasMore ? t('No more items') : t('See more'))}
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full p-2 sm:p-6 mt-4 sm:mt-6">
                        <Label className="text-2xl sm:text-4xl text-center font-semibold mb-4">{t('Explore More')}</Label>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full p-2 sm:p-6 mt-4 sm:mt-6">
                        <div className="w-full max-w-full">
                            <Grid />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}