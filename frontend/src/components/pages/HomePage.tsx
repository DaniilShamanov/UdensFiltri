"use client";

import React from 'react';
import { useRouter } from '@/navigation';
import { Shield, Truck, Headphones, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppImage } from '@/components/ui/image';
import { useTranslations } from 'next-intl';
import { getCategories, getProducts, productImageUrl } from '@/lib/catalog';
import { Category, Product } from '@/lib/types';
import { getErrorCode } from '@/lib/api';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const t = useTranslations('home');
  const tErrors = useTranslations('errors');

  React.useEffect(() => {
    (async () => {
      try {
        const [apiCategories, apiProducts] = await Promise.all([
          getCategories(),
          getProducts(new URLSearchParams({ page_size: '4' })),
        ]);
        setCategories(apiCategories);
        setFeaturedProducts(apiProducts.results.slice(0, 4));
      } catch (err) {
        const errorCode = getErrorCode(err);
        let message = 'Failed to load content';
        if (errorCode && tErrors.has(errorCode)) {
          message = tErrors(errorCode);
        }
        toast.error(message);
        setCategories([]);
        setFeaturedProducts([]);
      }
    })();
  }, [tErrors]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-accent/80 py-14 text-white sm:py-16 lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-12">
            <div className="space-y-5 text-center md:text-left">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {t.rich('heroTitle', {
                  highlight: (chunks) => <span className="text-accent">{chunks}</span>
                })}
              </h1>
              <p className="text-base text-white/90 sm:text-lg md:text-xl">
                {t('heroDescription')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => router.push('/products')}
                  className="min-h-11 w-full bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent/90 sm:w-auto"
                >
                  {t('shopNow')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/services')}
                  className="min-h-11 w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  {t('ourServices')}
                </Button>
              </div>
              <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:flex md:flex-wrap md:gap-7 md:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('freeShipping')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('expertSupport')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{t('qualityGuaranteed')}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative h-[400px]">
              <AppImage
                src="https://images.unsplash.com/photo-1511994501413-7752c87af739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHdhdGVyJTIwZ2xhc3N8ZW58MXx8fHwxNzY4MzgyNjExfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t('heroImageAlt')}
                fill
                className="rounded-2xl shadow-2xl object-cover"
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-12 sm:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <Card className="text-center border border-primary/10 bg-background/90 shadow-md transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.quality.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.quality.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-primary/10 bg-background/90 shadow-md transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.shipping.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.shipping.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-primary/10 bg-background/90 shadow-md transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('features.support.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('features.support.description')}</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-primary/10 bg-background/90 shadow-md transition-shadow hover:shadow-xl">
              <CardContent className="p-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t('qualityGuaranteed')}</h3>
                <p className="text-sm text-muted-foreground">{t('featured.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* All Products Banner */}
      <section className="py-12 bg-gradient-to-r from-secondary via-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{t('banner.title')}</h2>
              <p className="text-white/90 text-lg">{t('banner.description')}</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/products')}
              className="bg-white text-secondary hover:bg-white/90"
            >
              {t('banner.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-gradient-to-b from-muted/40 via-background to-muted/25 py-12 sm:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('categories.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          
          <div className="md:hidden overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 px-1">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="w-[82vw] max-w-[320px] flex-shrink-0 cursor-pointer border border-primary/15 bg-card/95 transition-shadow hover:border-primary hover:shadow-lg"
                  onClick={() => router.push(`/products?categoryId=${encodeURIComponent(category.id)}`)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white">
                        {category.icon === 'droplet' ? '💧' : category.icon === 'cog' ? '⚙️' : category.icon === 'waves' ? '🌊' : category.icon === 'filter' ? '🔧' : category.icon === 'wrench' ? '🔨' : '🧪'}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('categories.subcategoriesCount', { count: category.subCategories.length })}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {t('categories.browse')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => router.push(`/products?categoryId=${encodeURIComponent(category.id)}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-white">
                      {category.icon === 'droplet' ? '💧' : category.icon === 'cog' ? '⚙️' : category.icon === 'waves' ? '🌊' : category.icon === 'filter' ? '🔧' : category.icon === 'wrench' ? '🔨' : '🧪'}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('categories.subcategoriesCount', { count: category.subCategories.length })}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('categories.browse')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-card py-12 sm:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('featured.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('featured.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              return (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => router.push(`/products/${encodeURIComponent(product.id)}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-muted overflow-hidden rounded-t-lg">
                      <AppImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">{product.brand}</div>
                      <h3 className="font-semibold mb-2 line-clamp-2 h-12">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">€{product.price}</span>
                        {product.wholesalePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.wholesalePrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gradient-to-br from-primary/5 via-muted/60 to-destructive/5 py-12 sm:py-14 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">{t('about.title')}</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.quality.title')}</h3>
                    <p className="text-muted-foreground">{t('about.quality.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.installation.title')}</h3>
                    <p className="text-muted-foreground">{t('about.installation.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('about.support.title')}</h3>
                    <p className="text-muted-foreground">{t('about.support.description')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px]">
              <AppImage
                src="https://images.unsplash.com/photo-1676210134188-4c05dd172f89?w=600&h=400&fit=crop"
                alt={t('about.imageAlt')}
                fill
                className="rounded-xl shadow-xl object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;