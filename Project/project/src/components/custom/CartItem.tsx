import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { t } from "i18next";

export interface CartItemType {
  id: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  oldPrice: number;
}

interface CartItemProps {
  item: CartItemType;
  currentStock: number;
  onQuantityChange: (id: string, delta: number, productStock: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, currentStock, onQuantityChange, onRemove }: CartItemProps) {
  return (
    <Card className="flex flex-col md:flex-row gap-4 p-4 items-center">
      <img src={item.image} alt={item.name} className="w-full md:w-32 h-auto rounded-md" />
      <CardContent className="flex flex-col flex-1 space-y-2">
        <h3 className="text-lg font-semibold">{t(item.name)}</h3>
        <div className="flex items-center gap-2">
          <Badge>{t('Price')}: ${item.price}</Badge>
          {item.oldPrice && (
            <Badge className="bg-red-600 line-through select-none">{t('Old Price')}: ${item.oldPrice}</Badge>
          )}
        </div>
        <Label>{t('Size')}: {item.size}</Label>
        <Label>{t('Color')}: {item.color || t('N/A')}</Label>
        <Label>{t('Quantity')}: {item.quantity}</Label>
        <Label>{t('In Stock')}: {currentStock}</Label>
        <Label className="text-red-500">{currentStock <= 3 ? `${t('Left')} ${currentStock} ${t('pcs')}` : ""}</Label>
      </CardContent>
      <CardFooter className="flex flex-col md:items-end gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onQuantityChange(item.id, -1, currentStock)} disabled={item.quantity <= 1}>−</Button>
          <span>{item.quantity}</span>
          <Button size="sm" onClick={() => onQuantityChange(item.id, 1, currentStock)} disabled={item.quantity >= currentStock}>+</Button>
        </div>
        <Button variant="destructive" onClick={() => onRemove(item.id)}>{t('Remove')}</Button>
      </CardFooter>
    </Card >
  );
}
