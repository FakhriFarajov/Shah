import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { toast } from "sonner";
import { apiCallWithManualRefresh } from "@/shared/apiWithManualRefresh";
import { increaseQuantity, removeFromCart } from "@/features/profile/product/profile.service";
import { decreaseQuantity } from "@/features/profile/product/profile.service";
import { useNavigate } from "react-router-dom";
interface CartItemProps {
  item: any;
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState<number>(item?.quantity ?? 1);
  const quantityRef = useRef<number>(quantity);
  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);
  const variant = item.productVariant ?? item.variant ?? null;
  console.log("CartItem variant:", variant);
  const product = item.product ?? item.productInfo ?? null;
  const name = variant?.title ?? product?.productTitle ?? item.name ?? product?.storeName ?? 'Product';
  const price = variant?.price ?? item.price ?? 0;
  const stock = variant?.stock ?? item.stock ?? 0;
  // Try multiple places for image
  const image = variant?.images?.[0]?.imageUrl ?? item.mainImage ?? item.image ?? null;
  const attrs = variant?.attributes ?? item.attributes ?? [];
  console.log("CartItem image URL:", variant.id);
  const navigator = useNavigate();

  async function handleQuantityIncrease(opts?: { silent?: boolean }) {
    try {
      if (quantityRef.current >= stock) {
        if (!opts?.silent) toast.error(t('Cannot increase quantity. Stock limit reached.'));
        return;
      }
      await apiCallWithManualRefresh(() => increaseQuantity(variant.id));
      if (!opts?.silent) toast.success(t('Item quantity increased'));
      const next = quantityRef.current + 1;
      setQuantity(() => next);
      try {
        window.dispatchEvent(new CustomEvent('cart:quantity-changed', { detail: { variantId: variant.id, quantity: next } }));
        window.dispatchEvent(new CustomEvent('cart:count-delta', { detail: { delta: 1 } }));
      } catch { }
    } catch (error) {
      console.error("Failed to increase item quantity:", error);
      if (!opts?.silent) toast.error(t('Failed to increase item quantity'));
    }
  }

  async function handleQuantityDecrease(opts?: { silent?: boolean }) {
    try {
      if (quantityRef.current <= 1) {
        if (!opts?.silent) toast.error(t('Cannot decrease quantity below 1.'));
        return;
      }
      await apiCallWithManualRefresh(() => decreaseQuantity(variant.id));
      if (!opts?.silent) toast.success(t('Item quantity decreased'));
      const next = quantityRef.current - 1;
      setQuantity(() => next);
      try {
        window.dispatchEvent(new CustomEvent('cart:quantity-changed', { detail: { variantId: variant.id, quantity: next } }));
        window.dispatchEvent(new CustomEvent('cart:count-delta', { detail: { delta: -1 } }));
      } catch { }
    } catch (error) {
      console.error("Failed to decrease item quantity:", error);
      if (!opts?.silent) toast.error(t('Failed to decrease item quantity'));
    }
  }


  async function handleRemove(itemId: string) {
    try {
      const removedQty = quantityRef.current || 0;
      var res = await apiCallWithManualRefresh(() => removeFromCart(itemId));
      console.log("Item removed from cart:", res);
      toast.success(t('Item removed from cart'));
      // Notify app to refresh cart lists
      try {
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { action: 'remove', itemId } }));
        if (removedQty > 0) window.dispatchEvent(new CustomEvent('cart:count-delta', { detail: { delta: -removedQty } }));
      } catch { }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      toast.error(t('Failed to remove item from cart'));
    }
  }

  // Press-and-hold support
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdActiveRef = useRef<boolean>(false);

  function clearHolds() {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    holdActiveRef.current = false;
  }

  function startHold(mode: 'inc' | 'dec') {
    if (!variant?.id) return;
    if (holdTimeoutRef.current || holdIntervalRef.current) return; // already holding
    // After a short delay, start repeating
    holdTimeoutRef.current = setTimeout(() => {
      holdActiveRef.current = true;
      holdIntervalRef.current = setInterval(async () => {
        if (mode === 'inc') {
          if (quantityRef.current >= stock) {
            clearHolds();
            return;
          }
          await handleQuantityIncrease({ silent: true });
        } else {
          if (quantityRef.current <= 1) {
            clearHolds();
            return;
          }
          await handleQuantityDecrease({ silent: true });
        }
      }, 120);
    }, 300);
  }

  async function stopHold(mode: 'inc' | 'dec') {
    // If hold never activated, treat as a single click
    const wasActive = holdActiveRef.current;
    clearHolds();
    if (!variant?.id) return;
    if (!wasActive) {
      if (mode === 'inc') await handleQuantityIncrease();
      else await handleQuantityDecrease();
    }
  }

  useEffect(() => {
    return () => clearHolds();
  }, []);



  return (
    <Card className="flex flex-col md:flex-row gap-4 p-4 items-center">
      <img src={image || 'https://picsum.photos/seed/product1/400/400'} alt={name} className="w-full md:w-32 h-auto rounded-md" onClick={() => navigator(`/product?id=${product.id}&productVariantId=${variant.id}`)}/>
      <CardContent className="flex flex-col flex-1 ml-4 mb-2">
        <h3 className="text-lg font-semibold">{t(name)} - ${price}</h3>
        <div className="flex items-center gap-2 mb-2">
          <Label>{t('Subtotal')}: ${(price * quantity).toFixed(2)}</Label>
        </div>

        {/* Attributes */}
        {Array.isArray(attrs) && attrs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attrs.map((a: any, i: number) => (
              <Badge key={i} className="bg-gray-100 text-gray-800">{a.name ?? a.attributeName ?? a.attributeId}: {a.value}</Badge>
            ))}
          </div>
        )}

        <Label className="mb-2">{t('Quantity')}: {quantity}</Label>
        <Label className="mb-2">{t('In Stock')}: {stock}</Label>
        <Label className="text-red-500">{stock <= 3 ? `${t('Left')} ${stock} ${t('pcs')}` : ""}</Label>
      </CardContent>
      <CardFooter className="flex flex-col md:items-end gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onMouseDown={() => startHold('dec')}
            onMouseUp={() => stopHold('dec')}
            onMouseLeave={() => clearHolds()}
            onTouchStart={() => startHold('dec')}
            onTouchEnd={() => stopHold('dec')}
            disabled={quantity <= 1}
          >
            −
          </Button>
          <span>{quantity}</span>
          <Button
            size="sm"
            onMouseDown={() => startHold('inc')}
            onMouseUp={() => stopHold('inc')}
            onMouseLeave={() => clearHolds()}
            onTouchStart={() => startHold('inc')}
            onTouchEnd={() => stopHold('inc')}
            disabled={quantity >= stock}
          >
            +
          </Button>
        </div>
        <Button variant="destructive" onClick={() => handleRemove(variant.id)}>{t('Remove')}</Button>
      </CardFooter>
    </Card >
  );
}
