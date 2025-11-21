import NavBar from "@/components/custom/Navbar/navbar";
import Carousel from "@/components/custom/carousel";
import Footer from "@/components/custom/footer"
import { Label } from "@/components/ui/label";
import ProductCard from "@/components/custom/itemCard";
import "../i18n"; // Import i18n configuration
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getRandomPaginated } from "@/features/profile/product/profile.service";
import { getImage } from "@/shared/utils/imagePost";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";
import { tokenStorage } from "@/shared/tokenStorage";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import Spinner from "@/components/custom/Spinner";
import { getProductDetailsById } from "@/features/profile/product/profile.service";
import { toast } from "sonner";

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

    // Load product history from localStorage
    const [historyProducts, setHistoryProducts] = useState<any[]>([]);
    useEffect(() => {
        setLoading(true);
        const historyKey = 'productHistory';
        let history: Array<{ productId: string, variantId: string | null, timestamp: number }> = [];
        try {
            const raw = localStorage.getItem(historyKey);
            if (raw) history = JSON.parse(raw);
        } catch { }
        // Remove duplicates from history (keep most recent)
        const seen = new Set();
        history = history.filter(item => {
            const key = item.productId + ':' + (item.variantId ?? '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        // Fetch product details for each history entry (limit to 8 most recent)
        const fetchHistoryProducts = async () => {
            const results: any[] = [];
            for (const entry of history.slice(0, 8)) {
                try {
                    const res = await apiCallWithManualRefresh(() => getProductDetailsById(entry.productId));
                    const productData = res && res.data ? res.data : res;
                    // Optionally, set mainImage from variant if variantId is present
                    let imageUrl = productData.mainImage;
                    if (entry.variantId && Array.isArray(productData.variants)) {
                        const variant = productData.variants.find((v: any) => String(v.productVariantId ?? v.id) === String(entry.variantId));
                        if (variant && variant.images && variant.images.length > 0) {
                            imageUrl = variant.images[0].imageUrl ?? variant.images[0].url ?? variant.images[0];
                        }
                    }
                    // Resolve image if it's an ID or needs fetching
                    if (imageUrl) {
                        try {
                            const resolved = await getImage(imageUrl);
                            productData.mainImage = resolved || imageUrl;
                        } catch {
                            productData.mainImage = imageUrl;
                        }
                    } else {
                        productData.mainImage = "https://via.placeholder.com/300x200";
                    }
                    results.push(productData);
                } catch { }
            }
            setHistoryProducts(results);
        };
        setLoading(false);
        fetchHistoryProducts();
    }, []);

    useEffect(() => {
        const load = async () => {
            const tok: string | null = tokenStorage.get();
            const result = decodeUserFromToken(tok || "");
            setLoading(true);
            try {
                const userId = (result?.buyer_profile_id || result?.id) ?? null;
                const fetched = await apiCallWithManualRefresh(() => getRandomPaginated(currentPage, pageSize, userId as any));
                const payload: any = (fetched as any)?.data ?? fetched;

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
                                    const url = await getImage(element.mainImage);
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

                setHasMore(items.length >= pageSize);
                setProducts(prev => currentPage > 1 ? [...prev, ...items] : items);
            } catch (e) {
                toast.info("An error has occured.");
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
            <div className="min-h-screen w-full bg-gray-100">
                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Carousel slides={slides} size={250} />
                </div>

                <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                    <Label className="text-2xl sm:text-4xl font-semibold mb-4 block text-center">{t('Featured Products')}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2 sm:p-4">
                        {loading ? (
                            <div className="col-span-full text-center p-8">{t('Loading...')}</div>
                        ) : products.length === 0 ? (
                            <div className="col-span-full text-center p-8 text-gray-600">{t('No products found')}</div>
                        ) : (
                            products.map((product: any) => (
                                console.log("Rendering product:", product),
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

                    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
                        <Label className="text-2xl sm:text-4xl font-semibold mb-4 block text-center">{t('Recently Viewed')}</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-2 sm:p-4">
                            {historyProducts.length === 0 ? (
                                <div className="col-span-full text-center p-8 text-gray-600">{t('No recently viewed products')}</div>
                            ) : (
                                historyProducts.map((product: any) => (
                                    <ProductCard key={product.id || product.representativeVariantId} product={product} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}