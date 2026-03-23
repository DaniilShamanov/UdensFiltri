"use client";

import React from 'react';
import { useRouter } from '@/navigation';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { AppImage } from '@/components/ui/image';
import { useTranslations } from 'next-intl';
import { ProductQuantity } from '@/components/ui/quantity-input';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { user, cart, removeFromCart, updateCartQuantity } = useApp();
  const t = useTranslations('cart');

  const subtotal = cart.reduce((sum, item) => {
    const price = user?.is_company && item.product.wholesalePrice
      ? item.product.wholesalePrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{t('empty.title')}</h2>
          <p className="text-muted-foreground mb-8">{t('empty.description')}</p>
          <Button size="lg" onClick={() => router.push('/products')} className="bg-accent hover:bg-accent/90">
            {t('empty.browseButton')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => {
              const displayPrice = user?.is_company && item.product.wholesalePrice
                ? item.product.wholesalePrice
                : item.product.price;

              return (
                <Card key={item.product.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative">
                        <AppImage
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold mb-1 cursor-pointer hover:text-primary line-clamp-2"
                              onClick={() => router.push(`/products/${encodeURIComponent(item.product.id)}`)}
                            >
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-4">
                          {/* Replaced inline quantity with ProductQuantity */}
                          <ProductQuantity
                            value={item.quantity}
                            onChange={(newQty: number) => updateCartQuantity(item.product.id, newQty)}
                            min={1}
                            max={999}
                          />
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              €{(displayPrice * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t('item.eachPrice', { price: displayPrice.toFixed(2) })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">{t('summary.title')}</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('summary.subtotal', { count: cart.reduce((sum, item) => sum + item.quantity, 0) })}
                    </span>
                    <span className="font-medium">€{subtotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('summary.total')}</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={() => router.push('/checkout')}
                  >
                    {t('summary.checkoutButton')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/products')}
                  >
                    {t('summary.continueShopping')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;