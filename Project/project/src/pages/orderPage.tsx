import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/custom/Navbar/navbar";
import Footer from "@/components/custom/footer";
import { useSelector } from "react-redux";
import OrderItem from "@/components/custom/OrderItem";
import type { OrderItemType } from "@/components/custom/OrderItem";
import { TfiPackage } from "react-icons/tfi";
import { useTranslation } from "react-i18next";

export default function OrderPage() {
  const { t } = useTranslation();
  const orders = useSelector((state) => state.orders);

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-6 space-y-6 min-h-screen">
        <h1 className="text-2xl font-bold">{t('Order Tracking')}</h1>
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('Order')} #{order.trackingNumber}</h2>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {t(order.status)}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <Label>{t('Placed')}: {new Date(order.placedAt).toLocaleDateString()}</Label>
                <Label>
                  {t('Estimated Delivery')}:{" "}
                  {order.deliveryEstimate
                    ? new Date(order.deliveryEstimate).toLocaleDateString()
                    : t('TBD')}
                </Label>
                <Label>
                  {t('Customer')}: {order.customer.name} ({order.customer.email})
                </Label>

              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">{t('Items')}</h3>
                {order.items.map((item: OrderItemType) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </div>

              <CardFooter className="flex justify-between pt-4 border-t">
                <p className="text-lg font-semibold">{t('Total')}:</p>
                <p className="text-lg font-bold">
                  {order.currency} ${order.total}
                </p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center">
            <TfiPackage className="text-6xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('Your orders are yet to come!')}</h2>
            <Button className="py-2 px-4 rounded-lg" variant="outline">
              <a href="/main">{t('Go shopping!')}</a>
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
