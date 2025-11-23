import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { BsCart3 } from "react-icons/bs";
import CartItem from "@/components/custom/CartItem";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "@/features/services/product/products.service";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getImage } from "@/shared/utils/imagePost";
import { toast } from "sonner";
import Spinner from "@/components/custom/spinner";

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
                                            const url = await getImage(idOrUrl);
                                            variant.images[i].imageUrl = url || idOrUrl;
                                        } catch (e) {
                                            //
                                        }
                                    })
                                );
                            }

                            // fallback: set a mainImage on the cart entry for the UI to use
                            if (!element.mainImage) {
                                element.mainImage = variant?.images?.[0]?.imageUrl ?? element.mainImage ?? null;
                                if (element.mainImage) {
                                    try {
                                        const resolved = await getImage(element.mainImage);
                                        element.mainImage = resolved || element.mainImage;
                                    } catch (e) {
                                        // ignore
                                    }
                                }
                            }
                        } catch (e) {
                            setLoading(false);
                        }
                    }));
                } else if (items && Array.isArray(items.productVariants)) {
                    // older/alternative shape where response contains productVariants array
                    await Promise.all(items.productVariants.map(async (v: any) => {
                        if (Array.isArray(v.images)) {
                            await Promise.all(v.images.map(async (img: any, i: number) => {
                                try {
                                    const idOrUrl = img.imageUrl ?? img.url ?? img;
                                    const url = await getImage(idOrUrl);
                                    v.images[i].imageUrl = url || idOrUrl;
                                } catch (e) {
                                    setLoading(false);
                                }
                            }));
                        }
                    }));
                }
                setCartItems(items);
                setLoading(false);
            }
            catch (error) {
                navigate('/login');
                toast.info('You have to login in order to view your cart');
                setLoading(false);
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

    // Stock helpers for validation before checkout
    const stockForItem = (item: any): number => {
        const v = item.productVariant ?? item.variant ?? null;
        return (v?.availableQuantity ?? v?.stock ?? v?.quantity ?? item.stock ?? 0) as number;
    };
    const invalidItems = cartItems.filter((it) => {
        const stock = stockForItem(it);
        const qty = it.quantity || 0;
        return stock <= 0 || qty > stock;
    });
    const canCheckout = cartItems.length > 0 && invalidItems.length === 0;

    const handleProceedToCheckout = () => {
        if (!canCheckout) {
            if (cartItems.length === 0) {
                toast.info('Your cart is empty');
            } else {
                toast.error('Some items are out of stock or exceed available quantity. Please adjust your cart.');
            }
            return;
        }
        navigate('/checkout');
    };

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
            <div className="container mx-auto px-2 sm:px-4 py-4 min-h-screen">
                <h1 className="text-2xl font-bold mb-4 sm:mb-6">{'Your Cart'}</h1>
                {/* Mobile: stack summary below items, desktop: side-by-side */}
                <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, id) => (
                                <CartItem
                                    key={id}
                                    item={item}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64">
                                <BsCart3 className="text-6xl" />
                                <h2 className="text-xl font-semibold mb-4 mt-12">{'No items in your cart'}</h2>
                                <Button className="py-2 px-4 rounded-lg" variant="outline" onClick={() => navigate('/main')}>
                                    {'Go shopping!'}
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Cart Summary */}
                    <div className="w-full md:w-96 bg-white rounded-lg shadow-md p-4 sm:p-6 h-fit">
                        <h2 className="text-xl font-bold mb-4">{'Your cart'}</h2>
                        <div className="mb-2 flex justify-between text-base sm:text-lg">
                            <span>{'Products'} ({cartItems.length})</span>
                            <span className="font-semibold">
                                {cartItems.reduce((sum: number, item: any) => {
                                    const v = item.productVariant ?? item.variant ?? null;
                                    const price = v?.price ?? item.price ?? 0;
                                    const discountPrice = v?.discountPrice ?? price;
                                    return sum + (discountPrice * (item.quantity || 0));
                                }, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="mb-2 flex justify-between text-red-500 text-base sm:text-lg">
                            <span>{'Discount'}</span>
                            <span>
                                -{cartItems.reduce((sum: number, item: any) => {
                                    const v = item.productVariant ?? item.variant ?? null;
                                    const price = v?.price ?? item.price ?? 0;
                                    const discountPrice = v?.discountPrice ?? price;
                                    return sum + ((price - discountPrice) * (item.quantity || 0));
                                }, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="mb-4 flex justify-between font-bold text-lg">
                            <span>{'Total cost'}</span>
                            <span>
                                {cartItems.reduce((sum: number, item: any) => {
                                    const v = item.productVariant ?? item.variant ?? null;
                                    const discountPrice = v?.discountPrice ?? v?.price ?? item.price ?? 0;
                                    return sum + (discountPrice * (item.quantity || 0));
                                }, 0).toFixed(2)}
                            </span>
                        </div>
                        {invalidItems.length > 0 && (
                            <div className="mb-3 text-sm text-red-600">
                                {'Some items are out of stock or exceed available quantity. Please adjust your cart.'}
                            </div>
                        )}
                        <Button
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed text-base sm:text-lg"
                            onClick={handleProceedToCheckout}
                            disabled={!canCheckout}
                        >
                            {'Proceed to checkout'}
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}