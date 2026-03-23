"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '../ProductCard';
import { useTranslations } from 'next-intl';
import { getBrands, getCategories, getProducts } from '@/lib/catalog';
import { Category, Product } from '@/lib/types';
import { getErrorCode } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

function ProductsContent() {
  const MAX_PRICE = 5000;
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') || undefined;
  const subCategoryId = searchParams.get('subCategoryId') || undefined;
  const { user } = useApp();

  // Products state (current page)
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Categories for breadcrumb
  const [categories, setCategories] = useState<Category[]>([]);

  // Full list of brands (for filter)
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Filter state (sent to backend)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [range, setRange] = useState({ min: 0, max: MAX_PRICE });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const t = useTranslations('products');
  const tErrors = useTranslations('errors');

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all brands for filter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrandsList(data);
      } catch (error) {
        console.error('Failed to fetch brands', error);
        setBrandsList([]);
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch products when filters/page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: pageSize.toString(),
        });

        if (categoryId) params.append('category', categoryId);
        if (subCategoryId) params.append('subcategory', subCategoryId);
        if (searchQuery) params.append('search', searchQuery);

        if (sortBy !== 'featured') {
          const sortMap: Record<string, string> = {
            'price-low': 'price',
            'price-high': '-price',
            name: 'name',
          };
          const ordering = sortMap[sortBy];
          if (ordering) {
            params.append('ordering', ordering);
          }
        }

        if (selectedBrands.length > 0) {
          params.append('brand', selectedBrands.join(','));
        }
        if (inStockOnly) params.append('in_stock', 'true');
        if (range.min > 0) params.append('min_price', range.min.toString());
        if (range.max < MAX_PRICE) params.append('max_price', range.max.toString());

        const data = await getProducts(params);
        setProducts(data.results);
        setTotalProducts(data.count);
      } catch (err) {
        const errorCode = getErrorCode(err);
        let message = 'Failed to load products';
        if (errorCode && tErrors.has(errorCode)) {
          message = tErrors(errorCode);
        }
        setFetchError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    categoryId,
    subCategoryId,
    searchQuery,
    sortBy,
    selectedBrands,
    inStockOnly,
    range.min,
    range.max,
    tErrors,
  ]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    sortBy,
    selectedBrands,
    inStockOnly,
    range.min,
    range.max,
    categoryId,
    subCategoryId,
  ]);

  const resetFilters = () => {
    setRange({ min: 0, max: MAX_PRICE });
    setSelectedBrands([]);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Find current category/subcategory for breadcrumb
  const currentCategory = categories.find(c => c.id === categoryId);
  const currentSubCategory = currentCategory?.subCategories?.find(s => s.id === subCategoryId);

  const setMinPrice = (value: string) => {
    const parsed = Number(value);
    setRange(prev => ({
      ...prev,
      min: isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, prev.max)),
    }));
  };

  const setMaxPrice = (value: string) => {
    const parsed = Number(value);
    setRange(prev => ({
      ...prev,
      max: isNaN(parsed) ? prev.max : Math.min(MAX_PRICE, Math.max(parsed, prev.min)),
    }));
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-2 scrollbar-hide">
        <Label className="font-semibold">{t('filters.priceRange')} (€)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={MAX_PRICE}
            value={range.min}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Min €"
            className="flex-1"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            max={MAX_PRICE}
            value={range.max}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max €"
            className="flex-1"
          />
        </div>
      </div>

      {/* Brands – from full list */}
      {brandsList.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label className="font-semibold">{t('filters.brands')}</Label>
          </div>
          {brandsLoading ? (
            <div className="flex justify-center py-2">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <div className="space-y-2">
              {brandsList.map(brand => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="cursor-pointer font-normal">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Availability */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="font-semibold">{t('filters.availability')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={checked => setInStockOnly(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="cursor-pointer font-normal">
            {t('filters.inStockOnly')}
          </Label>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full cursor-pointer border-accent/35 text-accent hover:bg-accent/10 hover:text-accent"
        onClick={resetFilters}
      >
        {t('resetFilters')}
      </Button>
    </div>
  );

  // Show spinner while loading and no products (initial load or after filter that clears list)
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (fetchError) {
    return <p className="text-destructive">{fetchError}</p>;
  }

  return (
    <div className="relative min-h-screen bg-background py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
      <div className="container mx-auto px-4 scrollbar-hide">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="cursor-pointer hover:text-primary">
            {t('breadcrumb.home')}
          </Link>
          {' / '}
          <Link href="/products" className="cursor-pointer hover:text-primary">
            {t('breadcrumb.products')}
          </Link>
          {currentCategory && (
            <>
              {' / '}
              <span className="text-foreground">{currentCategory.name}</span>
            </>
          )}
          {currentSubCategory && (
            <>
              {' / '}
              <span className="text-foreground">{currentSubCategory.name}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-secondary dark:text-primary">
            {currentSubCategory
              ? currentSubCategory.name
              : currentCategory
              ? currentCategory.name
              : t('allProducts')}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1 cursor-pointer">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t('filtersButton')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetHeader>
                    <SheetTitle>{t('filtersTitle')}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                    <div className="border-y px-4 py-4">
                      <FilterSection />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <p className="text-muted-foreground order-2 md:order-1">
                  {t('showingCount', { count: totalProducts })}
                </p>
                <div className="flex items-center gap-2 order-1 md:order-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {t('sort.placeholder')}
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full cursor-pointer md:w-[200px]" />
                    <SelectContent>
                      <SelectItem value="featured">{t('sort.featured')}</SelectItem>
                      <SelectItem value="price-low">{t('sort.priceLowHigh')}</SelectItem>
                      <SelectItem value="price-high">{t('sort.priceHighLow')}</SelectItem>
                      <SelectItem value="name">{t('sort.nameAZ')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block">
            <Card className="sticky top-32 border-primary/20 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">{t('filtersTitle')}</h2>
                <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                  <FilterSection />
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div>
            {products.length === 0 ? (
              <Card className="border-destructive/20 bg-card/95 p-12 text-center shadow-sm">
                <p className="text-muted-foreground mb-4">{t('noProductsFound')}</p>
                <Button
                  variant="outline"
                  className="cursor-pointer border-primary/30 hover:bg-primary/10"
                  onClick={resetFilters}
                >
                  {t('clearAllFilters')}
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showWholesalePrice={user?.is_company}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ProductsPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
};

export default ProductsPage;