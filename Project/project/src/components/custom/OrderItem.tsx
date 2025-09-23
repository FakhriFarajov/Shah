import { Label } from "@/components/ui/label";
import { t } from "i18next";

export type OrderItemType = {
  id: string;
  name: string;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  oldPrice?: number;
};

interface OrderItemProps {
  item: OrderItemType;
}

const OrderItem = ({ item }: OrderItemProps) => (
  <div className="flex gap-4 items-center py-2">
    {item.image && (
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover"
        />

    )}
    <div className="flex-1">
      <p className="font-medium">{t(item.name)}</p>
      {item.size && <Label>{t("Size")}: {item.size}</Label>}
      {item.color && <Label>{t("Color")}: {item.color}</Label>}
      <Label>{t("Qty")}: {item.quantity}</Label>
    </div>
    <div className="text-right font-medium">
      <Label>{t('Price')}: ${item.price}</Label>
      {item.oldPrice && <Badge className="bg-red-600 line-through select-none">{t('Old Price')}: ${item.oldPrice}</Badge>}
    </div>
  </div>
);

export default OrderItem;
