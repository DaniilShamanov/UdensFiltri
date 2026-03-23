"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, Calendar, DollarSign, TrendingUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { usePathname, useRouter } from '@/navigation';
import { Order, OrderItem } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { fetchJson, getErrorCode } from '@/lib/api';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const t = useTranslations('orders');
  const tErrors = useTranslations('errors');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const pageSize = 10;

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: pageSize.toString(),
        });
        const url = `/api/orders/?${params.toString()}`;
        const data = await fetchJson<any>(url);
        const ordersArray = data?.results ?? [];
        setOrders(ordersArray);
        setTotalOrders(data?.count ?? 0);
        setTotalPages(Math.ceil((data?.count ?? 0) / pageSize));
      } catch (err) {
        const errorCode = getErrorCode(err);
        let message = 'Failed to load orders';
        if (errorCode && tErrors.has(errorCode)) {
          message = tErrors(errorCode);
        }
        setFetchError(message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, currentPage, pageSize, tErrors]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    if (!authLoading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  const filteredOrders = useMemo(() => {
    if (!user || !Array.isArray(orders)) return [];
    let result = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.id.toString().toLowerCase().includes(query) ||
        order.items.some((item: OrderItem) => 
          item.name.toLowerCase().includes(query)
        )
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'total-desc':
        result.sort((a, b) => b.total_price - a.total_price);
        break;
      case 'total-asc':
        result.sort((a, b) => a.total_price - b.total_price);
        break;
    }

    return result;
  }, [user, orders, searchQuery, statusFilter, sortBy]);

  if (authLoading || loading) return <p>{t('loading')}</p>;
  if (fetchError) return <p className="text-destructive">{fetchError}</p>;
  if (!user) return null;

  const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);
  const orderCount = orders.length;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return t('filter.pending');
      case 'processing': return t('filter.processing');
      case 'shipped': return t('filter.shipped');
      case 'delivered': return t('filter.delivered');
      case 'cancelled': return t('filter.cancelled');
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageDescription')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.totalOrders')}</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.totalSpent')}</p>
                  <p className="text-3xl font-bold">€{totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <DollarSign className="h-8 w-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('stats.averageOrder')}</p>
                  <p className="text-3xl font-bold">
                    €{totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]"/>
                <SelectContent>
                  <SelectItem value="all">{t('filter.allStatus')}</SelectItem>
                  <SelectItem value="pending">{t('filter.pending')}</SelectItem>
                  <SelectItem value="processing">{t('filter.processing')}</SelectItem>
                  <SelectItem value="shipped">{t('filter.shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('filter.delivered')}</SelectItem>
                  <SelectItem value="cancelled">{t('filter.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]"/>
                <SelectContent>
                  <SelectItem value="date-desc">{t('sort.newest')}</SelectItem>
                  <SelectItem value="date-asc">{t('sort.oldest')}</SelectItem>
                  <SelectItem value="total-desc">{t('sort.highestTotal')}</SelectItem>
                  <SelectItem value="total-asc">{t('sort.lowestTotal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {orders.length === 0
                  ? t('empty.noOrdersYet')
                  : t('empty.adjustFilters')}
              </p>
              {orders.length === 0 && (
                <Button onClick={() => router.push('/products')} className="bg-accent hover:bg-accent/90">
                  {t('empty.startShopping')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg font-mono">{order.id}</CardTitle>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {t('orderCard.itemsCount', { count: order.items.length })}
                            </div>
                            <div className="flex items-center gap-1">
                              €{(order.total_price ?? 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <ChevronDown 
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        
                        <div className="space-y-3 mb-4">
                          <h4 className="font-semibold">{t('orderCard.orderItems')}</h4>
                          {order.items.map((item: OrderItem) => {
                            const price = item.unit_price ?? 0;
                            return (
                              <div key={order.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                <div className="w-16 h-16 bg-muted rounded-md"></div>
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {t('orderCard.quantityLabel', { 
                                      quantity: item.quantity, 
                                      price: price.toFixed(2) 
                                    })}
                                  </p>
                                </div>
                                <p className="font-semibold">
                                  €{(price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <Separator className="my-4" />

                        <div>
                          <h4 className="font-semibold mb-2">{t('orderCard.shippingAddress')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_address}
                          </p>
                        </div>

                        <Separator className="my-4" />

                        {order.delivery_option && (
                          <div>
                            <h4 className="font-semibold mb-2">{t('orderCard.deliveryMethod')}</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.delivery_option.name} – €{(order.delivery_option.price_cents / 100).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
  );
};

export default OrdersPage;