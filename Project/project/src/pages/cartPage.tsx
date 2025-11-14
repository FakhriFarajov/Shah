import { useEffect, useState } from "react";
import { t } from "i18next";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { BsCart3 } from "react-icons/bs";
import CartItem from "@/components/custom/CartItem";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "@/features/profile/product/profile.service";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getProfileImage } from "@/shared/utils/imagePost";
import { toast } from "sonner";
import Spinner from "@/components/custom/Spinner";

export default function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchCartItems() {
            setLoading(true);
            try {
                var res = await apiCallWithManualRefresh(() => getCartItems());
                const items = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : (res?.data?.data || []);



                if (Array.isArray(items)) {
                    // items is an array of cart entries. Each entry may have `productVariant.images`.
                    await Promise.all(items.map(async (element: any) => {
                        try {
                            const variant = element.productVariant ?? element.variant ?? null;
                            if (variant && Array.isArray(variant.images)) {
                                await Promise.all(
                                    variant.images.map(async (img: any, i: number) => {
                                        try {
                                            const idOrUrl = img.imageUrl ?? img.url ?? img;
                                            const url = await getProfileImage(idOrUrl);
                                            variant.images[i].imageUrl = url || idOrUrl;
                                        } catch (e) {
                                            console.warn('Error resolving variant image', e);
                                        }
                                    })
                                );
                            }

                            // fallback: set a mainImage on the cart entry for the UI to use
                            if (!element.mainImage) {
                                element.mainImage = variant?.images?.[0]?.imageUrl ?? element.mainImage ?? null;
                                if (element.mainImage) {
                                    try {
                                        const resolved = await getProfileImage(element.mainImage);
                                        element.mainImage = resolved || element.mainImage;
                                    } catch (e) {
                                        // ignore
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn('Error processing cart item images', e);
                        }
                    }));
                } else if (items && Array.isArray(items.productVariants)) {
                    // older/alternative shape where response contains productVariants array
                    await Promise.all(items.productVariants.map(async (v: any) => {
                        if (Array.isArray(v.images)) {
                            await Promise.all(v.images.map(async (img: any, i: number) => {
                                try {
                                    const idOrUrl = img.imageUrl ?? img.url ?? img;
                                    const url = await getProfileImage(idOrUrl);
                                    v.images[i].imageUrl = url || idOrUrl;
                                } catch (e) {
                                    console.warn('Error resolving variant image', e);
                                }
                            }));
                        }
                    }));
                }
                console.log("Fetched cart items:", items);
                setCartItems(items);
                setLoading(false);
            }
            catch (error) {
                console.error("Failed to fetch cart items:", error);
                toast.error("Failed to load cart items");
            }
        }
        fetchCartItems();
        const onCartUpdated = () => { fetchCartItems(); };
        const onQtyChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail as { variantId?: string; quantity?: number };
            if (!detail?.variantId || typeof detail.quantity !== 'number') return;
            setCartItems(prev => prev.map(it => {
                const v = it.productVariant ?? it.variant;
                if (v?.id === detail.variantId) {
                    return { ...it, quantity: detail.quantity };
                }
                return it;
            }));
        };
        window.addEventListener('cart:updated', onCartUpdated as EventListener);
        window.addEventListener('cart:quantity-changed', onQtyChanged as EventListener);
        return () => {
            window.removeEventListener('cart:updated', onCartUpdated as EventListener);
            window.removeEventListener('cart:quantity-changed', onQtyChanged as EventListener);
        };
    }, []);



    const linePrice = (item: any) => {
        const v = item.productVariant ?? item.variant ?? null;
        const price = v?.price ?? item.price ?? 0;
        return price;
    };

    const total: number = cartItems.reduce(
        (sum: number, item: any) => sum + linePrice(item) * (item.quantity || 0),
        0
    );

    return (
        <>
        {
            loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16">
                        <Spinner />
                    </div>
                </div>
            )
        }
            <NavBar />
            <div className="container mx-auto px-4 py-6 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">{t('Your Cart')}</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, id) => {
                                return (
                                    <CartItem
                                        key={id}
                                        item={item}
                                    />
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64">
                                <BsCart3 className="text-6xl" />
                                <h2 className="text-xl font-semibold mb-4 mt-12">{t('No items in your cart')}</h2>
                                <Button className="py-2 px-4 rounded-lg" variant="outline" onClick={() => navigate('/main')}>
                                    {t('Go shopping!')}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="w-full md:w-96 bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-xl font-bold mb-4">{t('Your cart')}</h2>
                        <div className="mb-2 flex justify-between">
                            <span>{t('Products')} ({cartItems.length})</span>
                            <span className="font-semibold">{cartItems.reduce((sum: number, item: any) => {
                                const v = item.productVariant ?? item.variant ?? null;
                                const price = v?.price ?? item.price ?? 0;
                                const oldPrice = v?.oldPrice ?? item.oldPrice ?? price;
                                return sum + (oldPrice * (item.quantity || 0));
                            }, 0).toFixed(2)}</span>
                        </div>
                        <div className="mb-2 flex justify-between text-red-500">
                            <span>{t('Discount')}</span>
                            <span>
                                -{cartItems.reduce((sum: number, item: any) => {
                                    const v = item.productVariant ?? item.variant ?? null;
                                    const price = v?.price ?? item.price ?? 0;
                                    const oldPrice = v?.oldPrice ?? item.oldPrice ?? price;
                                    return sum + ((oldPrice - price) * (item.quantity || 0));
                                }, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="mb-4 flex justify-between font-bold text-lg">
                            <span>{t('Total cost')}</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg" onClick={() => navigate('/checkout')}>
                            {t('Proceed to checkout')}
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}