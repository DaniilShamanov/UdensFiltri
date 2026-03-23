"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchJson, getErrorCode } from "@/lib/api";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type OrderItem = {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
};

type Order = {
  id: number;
  status: string;
  total_price: number;
  created_at: string;
  email: string;
  customer_name: string;
  customer_address: string;
  items: OrderItem[];
  delivery_option: {
    id: number;
    name: string;
    price_cents: number;
  };
};

interface PaymentStatusPageProps {
  orderId: string;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ orderId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const t = useTranslations('paymentStatus');
  const tErrors = useTranslations('errors');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollId: any = null;

    const buildUrl = () => {
      let url = `/api/orders/${encodeURIComponent(orderId)}/`;
      if (sessionId) {
        url += `?session_id=${encodeURIComponent(sessionId)}`;
      }
      return url;
    };

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJson<Order>(buildUrl());
        if (isMounted) setOrder(data);
      } catch (e: any) {
        if (isMounted) {
          const errorCode = getErrorCode(e);
          let message = t('errors.loadFailed');
          if (errorCode && tErrors.has(errorCode)) {
            message = tErrors(errorCode);
          }
          setError(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    pollId = setInterval(async () => {
      if (!isMounted) return;
      try {
        const data = await fetchJson<Order>(buildUrl());
        if (!isMounted) return;
        setOrder(data);
        if (data.status === "paid" || data.status === "failed" || data.status === "canceled") {
          clearInterval(pollId);
          pollId = null;
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);

    return () => {
      isMounted = false;
      if (pollId) clearInterval(pollId);
    };
  }, [orderId, sessionId, tErrors, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t('loading')}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <h2 className="text-2xl font-bold mb-3">{t('orderNotFound.title')}</h2>
          <p className="text-muted-foreground mb-6">{error || t('orderNotFound.description')}</p>
          <Button onClick={() => router.push("/")}>{t('orderNotFound.returnHome')}</Button>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";
  const isFailed = order.status === "failed";

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isPaid ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-muted"}`}>
            {isPaid ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : isFailed ? (
              <XCircle className="h-12 w-12 text-red-600" />
            ) : (
              <Loader2 className="h-12 w-12 animate-spin" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPaid ? t('status.paid') : isFailed ? t('status.failed') : t('status.processing')}
          </h1>
          <p className="text-muted-foreground">
            {isPaid
              ? t('status.paidDescription')
              : isFailed
              ? t('status.failedDescription')
              : t('status.processingDescription')}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold mb-1">{t('orderNumber')}</h2>
                <p className="text-2xl font-mono font-bold text-primary">{order.id}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPaid ? "bg-green-100 text-green-700" : isFailed ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"}`}>
                {order.status}
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">{t('orderDate')}</h3>
                <p className="text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('orderTotal')}</h3>
                <p className="text-2xl font-bold text-primary">
                  €{order.total_price.toFixed(2)}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">{t('shippingAddress')}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {order.customer_name ? <>{order.customer_name}<br /></> : null}
                {order.customer_address}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">{t('deliveryMethod')}</h3>
              <p className="text-muted-foreground">
                {order.delivery_option.name} – €{(order.delivery_option.price_cents / 100).toFixed(2)}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">{t('orderItems', { count: order.items.length })}</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('quantityLabel', { quantity: item.quantity })}
                      </p>
                    </div>
                    <p className="font-medium">
                      €{(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {!isPaid && (
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90" onClick={() => router.push("/checkout")}>
              {t('tryAgain')}
            </Button>
          )}
          <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/")}>
            <Home className="mr-2 h-5 w-5" /> {t('returnHome')}
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/products")}>
            {t('continueShopping')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;