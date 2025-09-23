import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    removeFromCart,
    clearCart,
    updateQuantity
} from "@/store/cartSlice";
import { t } from "i18next";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { addOrder } from "@/store/orderSlice";
import { updateProductStock } from "@/store/productSlice";
import { BsCart3 } from "react-icons/bs";
import CartItem from "@/components/custom/CartItem";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state: any) => state.cart);
    const products = useSelector((state: any) => state.product);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

    const handleQuantityChange = (
        id: string,
        delta: number,
        productStock: number,
        size?: string,
        color?: string
    ) => {
        dispatch(updateQuantity({ id, delta, productStock, size, color }));
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const handleCheckout = () => {
        const newOrder = {
            id: `order-${Date.now()}`,
            trackingNumber: Math.random().toString(36).substring(2, 10).toUpperCase(),
            customer: formData,
            items: cartItems.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color,
                image: item.image
            })),
            total: total.toFixed(2),
            status: "Processing",
            placedAt: new Date().toISOString()
        };
        console.log("Placing order:", newOrder);

        cartItems.forEach((cartItem) => {
            dispatch(updateProductStock({ id: cartItem.id, quantity: cartItem.quantity }));
        });

        dispatch(addOrder(newOrder));
        dispatch(removeFromCart(cartItems.map(item => item.id)));
        setDialogOpen(false);
        dispatch(clearCart());
        setFormData({ name: "", email: "", phone: "" });
    };

    return (
        <>
            <NavBar />
            <div className="container mx-auto px-4 py-6 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">{t('Your Cart')}</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        {cartItems.length > 0 ? (
                            cartItems.map((item) => {
                                const product = products.find(p => p.id === item.id);
                                const currentStock = product ? product.inStock : 0;
                                return (
                                    <CartItem
                                        key={item.id + (item.size || '') + (item.color || '')}
                                        item={item}
                                        currentStock={currentStock}
                                        onQuantityChange={(id, delta) => handleQuantityChange(id, delta, currentStock, item.size, item.color)}
                                        onRemove={(id) => dispatch(removeFromCart(id))}
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
                            <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.oldPrice * item.quantity, 0).toFixed(2)}</span>
                        </div>
                        <div className="mb-2 flex justify-between text-red-500">
                            <span>{t('Discount')}</span>
                            <span>
                                -{cartItems.reduce((sum, item) => sum + ((item.oldPrice - item.price) * item.quantity), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="mb-4 flex justify-between font-bold text-lg">
                            <span>{t('Total cost')}</span>
                            <span>{total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg" onClick={() => setDialogOpen(true)}>
                            {t('Proceed to checkout')}
                        </Button>
                    </div>
                </div>
            </div>
            {cartItems.length > 0 ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('Checkout Details')}</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCheckout();
                            }}
                            className="space-y-4"
                        >
                            <Input required placeholder={t('Full Name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <Input required type="email" placeholder={t('Email')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            <Input required type="tel" pattern="^\+?[0-9\- ]{10,20}$" title={t('Please enter a valid phone number (10-15 digits, optional +)')} placeholder={t('Phone')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <DialogFooter>
                                <Button type="submit">{t('Place Order')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('Cart is empty')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-center">{t('You have no items in your cart. Please add some products before proceeding to checkout.')}</p>
                        <DialogFooter>
                            <Button onClick={() => setDialogOpen(false)}>{t('Close')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            <Footer />

        </>
    );
}