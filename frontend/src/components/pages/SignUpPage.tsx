"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Lock, User as UserIcon, Phone, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/contexts/AppContext";
import { authApi } from "@/lib/auth/api";
import { Link, useRouter } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { sanitizeNextPath } from "@/lib/safeRedirect";
import { extractErrorMessage, getErrorCode } from "@/lib/api";
import { Suspense } from "react";
import VerificationCodeInput from "@/components/VerificationCodeInput";

function SignUpContent() {
  const { signUp } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('signUp');
  const tErrors = useTranslations('errors');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [awaitingEmailCode, setAwaitingEmailCode] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");

  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error(t('toast.passwordTooShort', { min: 6, current: formData.password.length }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('toast.passwordsMismatch'));
      return;
    }
    if (!formData.agreeToTerms) {
      toast.error(t('toast.termsNotAgreed'));
      return;
    }
    if (!awaitingEmailCode) {
      toast.error(t('toast.verifyEmailFirst'));
      return;
    }
    if (!verificationCode.trim()) {
      toast.error(t('toast.verificationCodeRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name?.trim() || "",
        last_name: formData.last_name?.trim() || "",
        code: verificationCode.trim(),
        ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
      };

      await signUp(payload as any);
      toast.success(t('toast.accountCreated'));
      const next = sanitizeNextPath(searchParams.get("next"), "/");
      router.replace(next);
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const errorCode = getErrorCode(err);
      let errorMessage = extractErrorMessage(err, t('toast.tryAgain'));
      if (errorCode && tErrors.has(errorCode)) {
        errorMessage = tErrors(errorCode);
      }
      toast.error(t('toast.signUpFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationRequest = async () => {
    if (!formData.email.trim()) {
      toast.error(t('toast.emailRequiredForVerification'));
      return;
    }
    if (!awaitingEmailCode) {
      if (formData.password.length < 6) {
        toast.error(t('toast.passwordTooShort', { min: 6, current: formData.password.length }));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('toast.passwordsMismatch'));
        return;
      }
      if (!formData.agreeToTerms) {
        toast.error(t('toast.termsNotAgreed'));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = { email: formData.email.trim(), purpose: 'register' };
      if (awaitingEmailCode) {
        await authApi.resendCode(payload);
        toast.success(t('toast.verificationCodeResent'));
      } else {
        await authApi.sendCode(payload);
        setAwaitingEmailCode(true);
        setVerificationCode("");
        toast.success(t('toast.verificationCodeSent'));
      }
    } catch (err: unknown) {
      const errorCode = getErrorCode(err);
      let errorMessage = extractErrorMessage(err, t('toast.tryAgain'));
      if (errorCode && tErrors.has(errorCode)) {
        errorMessage = tErrors(errorCode);
      }
      toast.error(t('toast.signUpFailed'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-primary/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('descriptionForm')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">{t('firstNameLabel')}</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder={t('firstNamePlaceholder')}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="last_name">{t('lastNameLabel')}</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder={t('lastNamePlaceholder')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('phonePlaceholder')}
                  className="pl-10"
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('phoneHint')}</p>
            </div>

            <div>
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setAwaitingEmailCode(false);
                      setVerificationCode("");
                      handleChange(e);
                    }}
                    placeholder={t('emailPlaceholder')}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerificationRequest}
                  disabled={isSubmitting || !formData.email.trim()}
                >
                  {awaitingEmailCode ? t('resendButton') : t('verifyButton')}
                </Button>
              </div>
              {!awaitingEmailCode && (
                <p className="text-xs text-muted-foreground mt-1">{t('emailHint')}</p>
              )}
            </div>

            {awaitingEmailCode && (
              <VerificationCodeInput
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                label={t('verificationCodeLabel')}
                placeholder={t('verificationCodePlaceholder')}
                banner={t('verificationBanner')}
                autoFocus
              />
            )}

            <div>
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('passwordPlaceholder')}
                  className="pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                }
              />
              <Label htmlFor="agreeToTerms" className="cursor-pointer font-normal text-sm">
                {t.rich('agreeToTerms', {
                  termsLink: (chunks) => (
                    <Link href="/info/terms" className="text-primary hover:underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isSubmitting}
            >
              {awaitingEmailCode ? t('confirmCodeButton') : t('createAccountButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
              <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
                {t('signInLink')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const SignUpPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
};

export default SignUpPage;