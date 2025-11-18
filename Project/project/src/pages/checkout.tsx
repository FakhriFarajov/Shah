import { useEffect, useState, useMemo } from "react";
import { t } from "i18next";

import { Button } from "@/components/ui/button";
import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import CartItem from "@/components/custom/CartItem";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "@/features/profile/product/profile.service";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { getProfileImage } from "@/shared/utils/imagePost";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getBuyerAddress } from "@/features/profile/addressService/address.service";
import { getBuyerProfile } from "@/features/profile/ProfileServices/profile.service";
import { tokenStorage } from "@/shared";
import { jwtDecode } from "jwt-decode";
import { getCountries } from "@/features/profile/Country/country.service";
import GooglePayButton from "@google-pay/button-react";

import { checkout } from '@/features/payment/checkout.service';
import Spinner from "@/components/custom/Spinner";


export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [buyer, setBuyer] = useState<any>(null);
    const [address, setAddress] = useState<any>(null);
    const [showConfirmAddressDialog, setShowConfirmAddressDialog] = useState(false);
    const [addressConfirmed, setAddressConfirmed] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        setLoading(true);
        async function fetchCartItems() {
            try {
                var res = await apiCallWithManualRefresh(() => getCartItems());
                const items = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : (res?.data?.data || []);


                if(items.length === 0) {
                    navigate('/main');
                    toast.info(t('Your cart is empty.'));
                }

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
                setCartItems(items);
            }
            catch (error) {
                console.error("Failed to fetch cart items:", error);
                toast.error("Failed to load cart items");
            }
        }
        async function fetchCountries() {
            try {
                const countriesResult = await apiCallWithManualRefresh(() => getCountries());
                setCountries(countriesResult);
                console.log("Fetched countries:", countriesResult);
            } catch (error) {
                console.error("Failed to fetch countries:", error);
            }
        }
        async function fetchBuyerAndAddress() {
            try {
                let token = tokenStorage.get();
                if (!token) {
                    const params = new URLSearchParams(window.location.search);
                    const urlToken = params.get('access_token');
                    if (urlToken) {
                        localStorage.setItem('access_token', urlToken);
                        token = urlToken;
                    }
                }
                if (!token) return;
                let buyerId = "";
                try {
                    const decoded: any = jwtDecode(token);
                    buyerId = decoded.buyer_profile_id;
                } catch {
                    // ignore
                }
                if (!buyerId) return;
                const buyerRes = await apiCallWithManualRefresh(() => getBuyerProfile(buyerId));
                setBuyer(buyerRes);
                const addr = await apiCallWithManualRefresh(() => getBuyerAddress(buyerId));
                setAddress(addr);
                console.log("Fetched buyer address:", addr);
                try {
                    const key = `addressConfirmed:${buyerId}`;
                    const persisted = localStorage.getItem(key);
                    setAddressConfirmed(persisted === "true");
                } catch {
                    // ignore
                }
                if (!addr || !addr.street) {
                    toast.info('Please add your address in profile to continue checkout.');
                    navigate('/profile');
                }
            } catch (e) {
                // soft-fail
            }
        }
        fetchCartItems();
        fetchCountries();
        fetchBuyerAndAddress();
        // Listen for global cart updates (e.g., item removed from product page or cart item)
        const onCartUpdated = () => { fetchCartItems(); };
        const onQtyChanged = (e: any) => {
            const { variantId, quantity } = (e?.detail || {}) as { variantId?: string; quantity?: number };
            if (!variantId || quantity == null) return;
            setCartItems((prev) => prev.map((ci: any) => {
                const v = ci.productVariant ?? ci.variant;
                return v?.id === variantId ? { ...ci, quantity } : ci;
            }));
        };
        setLoading(false);

        window.addEventListener('cart:updated', onCartUpdated as EventListener);
        window.addEventListener('cart:quantity-changed', onQtyChanged as EventListener);
        return () => {
            window.removeEventListener('cart:updated', onCartUpdated as EventListener);
            window.removeEventListener('cart:quantity-changed', onQtyChanged as EventListener);
        };
    }, []);

    const linePrice = (item: any) => {
        const variant = item.productVariant ?? item.variant ?? {};
        const price = Number(variant.price ?? item.price ?? 0);
        return price * Number(item.quantity || 0);
    };
    const lineOldPrice = (item: any) => {
        const variant = item.productVariant ?? item.variant ?? {};
        const oldPrice = Number(variant.oldPrice ?? item.oldPrice ?? variant.price ?? item.price ?? 0);
        return oldPrice * Number(item.quantity || 0);
    };
    const productsSubtotal = useMemo(() => cartItems.reduce((sum, it) => sum + lineOldPrice(it), 0), [cartItems]);
    const discountTotal = useMemo(() => cartItems.reduce((sum, it) => sum + Math.max(0, lineOldPrice(it) - linePrice(it)), 0), [cartItems]);
    const total: number = useMemo(() => cartItems.reduce((sum, it) => sum + linePrice(it), 0), [cartItems]);

    const handleCheckout = async () => {
        setLoading(true);
        if (!address || !address.street) {
            toast.info('Please add your shipping address first.');
            navigate('/profile');
            return;
        }
        if (!addressConfirmed) {
            toast.info('Please confirm your address before checkout.');
            setShowConfirmAddressDialog(true);
            return;
        }
        if (!buyer) {
            toast.error('Buyer missing');
            return;
        }
        // Perform backend checkout to create order, payment, receipt
        const res = await checkout({
            currency: 'USD',
            gatewayTransactionId: '', // manual checkout has no gateway txn yet
        });
        if (!res.isSuccess) {
            toast.error(res.message || 'Checkout failed');
            return;
        }
        const summary = res.data!;
        toast.success(`Order ${summary.OrderId} created!`);
        // Clear cart UI
        window.dispatchEvent(new CustomEvent('cart:updated'));
        setLoading(false);
        navigate('/');
    };

    const handleConfirmAddress = () => {
        if (!buyer) return;
        try {
            const key = `addressConfirmed:${buyer.id}`;
            localStorage.setItem(key, "true");
        } catch { }
        setAddressConfirmed(true);
        window.dispatchEvent(new CustomEvent('address:confirmed', { detail: { address } }));
        toast.success('Address confirmed');
        setShowConfirmAddressDialog(false);
    };

    const handleGooglePaySuccess = async (paymentRequestData: any) => {
        if (!buyer) {
            toast.error('User missing for payment.');
            return;
        }
        setProcessingPayment(true);
        setPaymentStatus('Initiated');
        try {
            const gatewayTransactionId = paymentRequestData?.paymentMethodData?.tokenizationData?.token || paymentRequestData?.paymentMethodData?.info?.cardNetwork || 'txn-temp';
            // Perform backend checkout directly with gateway transaction id
            const checkoutRes = await checkout({
                currency: 'USD',
                method: 4,
                gatewayTransactionId,
            });
            if (!checkoutRes.isSuccess) {
                setPaymentStatus('Failed');
                toast.error(checkoutRes.message || 'Checkout failed');
                return;
            }
            const summary = checkoutRes.data!;
            setPaymentStatus('Authorized');
            toast.success('Payment authorized');
            toast.success(`Order ${summary.OrderId} created!`);
            window.dispatchEvent(new CustomEvent('cart:updated'));
            navigate('/');
        } catch (e: any) {
            setPaymentStatus('Failed');
            console.log('Google Pay processing error:', e);
            toast.error(e?.message || 'Payment error');
        } finally {
            setProcessingPayment(false);
        }

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
            <div className="container mx-auto px-4 py-6 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">{t('Your Cart')}</h1>
                <div className="w-full mx-auto max-w-7xl p-2 sm:p-6 bg-white rounded-lg mt-4">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="flex-1 w-full min-w-0 justify-center">
                                {cartItems.map((item, id) => {
                                    return (
                                        <CartItem
                                            key={id}
                                            item={item}
                                        />
                                    );
                                })}
                        </div>
                        <div className="w-full md:w-96 bg-white rounded-lg shadow-md p-2 sm:p-6 h-fit sticky top-2 self-start">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold">{t('Your cart')}</h2>
                                <div className="text-xs">
                                    {!address || !address.street ? (
                                        <button className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700" onClick={() => navigate('/profile')}>
                                            {t('Add address in profile')}
                                        </button>
                                    ) : addressConfirmed ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700">{t('Address confirmed')}</span>
                                    ) : (
                                        <button className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700" onClick={() => setShowConfirmAddressDialog(true)}>
                                            {t('Confirm address')}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span>{t('Products')} ({cartItems.length})</span>
                                <span className="font-semibold">{productsSubtotal.toFixed(2)}</span>
                            </div>


                            <div className="mb-2 flex justify-between">
                                <span>{t('Shipping')}</span>
                                <span className="font-semibold">{t('Free IMPLEMENTED!')}</span>
                            </div>

                            <div className="mb-2 flex justify-between text-red-500">
                                <span>{t('Discount')}</span>
                                <span>
                                    -{discountTotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="mb-4 flex justify-between font-bold text-lg">
                                <span>{t('Total cost')}</span>
                                <span>{total.toFixed(2)}</span>
                            </div>
                            {!addressConfirmed ? (
                                <div className="flex justify-center">
                                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled>
                                        {t('Confirm the address to proceed')}
                                    </button>
                                </div>
                            ) : (
                                <div className="justify-center flex">
                                    <GooglePayButton
                                        environment="TEST"
                                        paymentRequest={{
                                            apiVersion: 2,
                                        apiVersionMinor: 0,
                                        allowedPaymentMethods: [
                                            {
                                                type: 'CARD',
                                                parameters: {
                                                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                                },
                                                tokenizationSpecification: {
                                                    type: 'PAYMENT_GATEWAY',
                                                    parameters: {
                                                        gateway: 'example',
                                                        gatewayMerchantId: 'exampleGatewayMerchantId',
                                                    },
                                                },
                                            },
                                        ],
                                        merchantInfo: {
                                            merchantId: '12345678901234567890',
                                            merchantName: 'Demo Merchant',
                                        },
                                        transactionInfo: {
                                            totalPriceStatus: 'FINAL',
                                            totalPriceLabel: 'Total',
                                            totalPrice: total.toFixed(2),
                                            currencyCode: 'USD',
                                            countryCode: 'US',
                                        },
                                    }}
                                    onLoadPaymentData={paymentRequest => {
                                        console.log('Success', paymentRequest);
                                        handleGooglePaySuccess(paymentRequest);
                                    }}
                                    onError={error => {
                                        console.error('Error', error);
                                        toast.error('Payment failed to load. Please try again.');
                                    }}
                                    buttonColor="default"
                                    buttonType="buy"
                                />
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Confirm Address Dialog */}
            <Dialog open={showConfirmAddressDialog} onOpenChange={setShowConfirmAddressDialog}>
                <DialogContent className="max-w-lg w-full">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t('Confirm your address')}</h3>
                        <p className="text-sm text-gray-500">Be careful when confirming your address. If the address is incorrect go to profile then change or add it!</p>
                        {!address || !address.street ? (
                            <div className="text-gray-500">{t('No address found. Please add your address in profile first.')}</div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">{t('Street')}:</span> {address.street}</div>
                                <div><span className="font-medium">{t('City')}:</span> {address.city}</div>
                                <div><span className="font-medium">{t('State')}:</span> {address.state}</div>
                                <div><span className="font-medium">{t('Postal Code')}:</span> {address.postalCode}</div>
                                <div><span className="font-medium">{t('Country')}:</span> {countries.find(country => country.id === address.countryId)?.name || address.country}</div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setShowConfirmAddressDialog(false)}>{t('Cancel')}</Button>
                            {!address || !address.street ? (
                                <Button onClick={() => { setShowConfirmAddressDialog(false); navigate('/profile'); }}>
                                    {t('Go to profile to add address')}
                                </Button>
                            ) : (
                                <Button onClick={handleConfirmAddress}>{t('Yes, it is my address')}</Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}