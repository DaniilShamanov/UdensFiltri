"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/navigation";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from "next-intl";
import { sanitizeNextPath } from "@/lib/safeRedirect";
import { extractErrorMessage, getErrorCode } from "@/lib/api";

function SignInContent() {
  const { signIn } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const t = useTranslations('signIn');
  const tErrors = useTranslations('errors');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ email: form.email, password: form.password });
      toast.success(t('toast.success'));
      const next = sanitizeNextPath(searchParams.get("next"), "/");
      router.replace(next);
    } catch (err: any) {
      const errorCode = getErrorCode(err);
      let errorMessage = extractErrorMessage(err, t('toast.errorDescription'));
      if (errorCode && tErrors.has(errorCode)) {
        errorMessage = tErrors(errorCode);
      }
      toast.error(t('toast.error'), {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-primary/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t('passwordPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            <Button disabled={loading} type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90">
              {loading ? t('signingIn') : t('signInButton')}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
                {t('forgotPasswordLink')}
              </Link>
            </div>

            <Separator />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('noAccount')} </span>
              <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                {t('createAccountLink')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const SignInPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
};

export default SignInPage;