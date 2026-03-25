"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/auth/api";
import { Link, useRouter } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getErrorCode, extractErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetFields, setShowResetFields] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingCode(true);
    try {
      await authApi.sendCode({ email, purpose: "reset_password" });
      setShowResetFields(true);
      toast.success(t("toast.codeSuccessTitle"), {
        description: t("toast.codeSuccessDescription"),
      });
    } catch (err: any) {
      const errorCode = getErrorCode(err);
      let message = extractErrorMessage(err, t("toast.codeErrorDescription"));
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(t("toast.codeErrorTitle"), {
        description: message,
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirming(true);
    try {
      await authApi.resetPassword({
        email,
        code: code.trim(),
        new_password: newPassword,
      });
      toast.success(t("toast.resetSuccessTitle"), {
        description: t("toast.resetSuccessDescription"),
      });
      router.push("/auth/sign-in");
    } catch (err: any) {
      const errorCode = getErrorCode(err);
      let message = extractErrorMessage(err, t("toast.resetErrorDescription"));
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(t("toast.resetErrorTitle"), {
        description: message,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-primary/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {showResetFields ? t("description.after") : t("description.before")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={showResetFields ? handleConfirm : handleSendCode} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="pl-10"
                  disabled={isSendingCode || isConfirming}
                />
              </div>
            </div>

            {showResetFields && (
              <>
                <div>
                  <Label htmlFor="code">{t("codeLabel")}</Label>
                  <Input
                    id="code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t("codePlaceholder")}
                    disabled={isConfirming}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">{t("newPasswordLabel")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("newPasswordPlaceholder")}
                    disabled={isConfirming}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isSendingCode || isConfirming}
            >
              {showResetFields
                ? isConfirming
                  ? t("confirming")
                  : t("confirmButton")
                : isSendingCode
                  ? t("sending")
                  : t("submitButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <Link href="/auth/sign-in" className="text-sm text-primary hover:underline">
                {t("backToSignIn")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
