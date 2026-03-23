"use client";

import React, { useEffect } from "react";
import { useRouter } from "@/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Payment is handled by Stripe Checkout from the Checkout page.
// This route stays for backwards compatibility (old navigation) and simply redirects.
const PaymentPage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('payment');

  useEffect(() => {
    // Redirect users to checkout where Stripe Checkout is started.
    router.replace("/checkout");
  }, [router]);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
            <Button className="w-full" onClick={() => router.push("/checkout")}>
              {t('button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;