"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, Minus, Plus, Check, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from '@/navigation';
import { AppImage } from '@/components/ui/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { getProduct, productImageUrl } from '@/lib/catalog';
import { Product } from '@/lib/types';
import { getErrorCode } from '@/lib/api';

interface ProductDetailPageProps {
  productId: number;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const router = useRouter();
  const { user, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('productDetail');
  const tErrors = useTranslations('errors');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err) {
        const errorCode = getErrorCode(err);
        let message = 'Failed to load product';
        if (errorCode && tErrors.has(errorCode)) {
          message = tErrors(errorCode);
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, tErrors]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('notFound.title')}</h2>
        <p className="text-muted-foreground mb-6">{error || t('notFound.description')}</p>
        <Button onClick={() => router.push('/products')}>{t('backToProducts')}</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(t('toast.added', { count: quantity, name: product.name }), {
      description: product.name,
    });
  };

  const displayPrice = user?.is_company && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;

  const imageUrl = productImageUrl(product.image, 800);
  const thumbnailUrl = productImageUrl(product.image, 200);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/products')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('backToProducts')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 relative">
              <AppImage
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden border cursor-pointer hover:border-primary relative">
                  <AppImage
                    src={product.image}
                    alt={`${product.name} ${i}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.brand}</Badge>
                {product.inStock ? (
                  <Badge className="bg-green-500">{t('inStock')}</Badge>
                ) : (
                  <Badge variant="destructive">{t('outOfStock')}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            </div>

            <Separator />

            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary">€{displayPrice.toFixed(2)}</span>
                {user?.is_company && product.wholesalePrice && product.wholesalePrice < product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    €{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              {user?.is_company && product.wholesalePrice && (
                <Badge className="bg-accent">{t('wholesaleBadge')}</Badge>
              )}
            </div>

            <Separator />

            <div>
              <label className="block font-semibold mb-3">{t('quantityLabel')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => {
                      const value = parseInt(event.target.value, 10);
                      if (Number.isNaN(value)) return;
                      setQuantity(Math.max(1, value));
                    }}
                    className="h-10 w-16 rounded-none border-y-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t('addToCart')}
                </Button>
              </div>
            </div>

            <Card className="bg-muted/30 border-none">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.freeShipping.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.freeShipping.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.warranty.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.warranty.description')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('features.returns.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('features.returns.description')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="description">{t('tabs.description')}</TabsTrigger>
            <TabsTrigger value="specifications">{t('tabs.specifications')}</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('description.title')}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {product.description}
                </p>
                <h4 className="font-semibold mb-3">{t('description.featuresTitle')}</h4>
                <ul className="space-y-2">
                  {t.raw('description.features').map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('specifications.title')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.brand')}</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.model')}</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.category')}</span>
                    <span className="font-medium capitalize">{product.category?.replace('-', ' ') ?? '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{t('specifications.warranty')}</span>
                    <span className="font-medium">{t('specifications.warrantyValue')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage;