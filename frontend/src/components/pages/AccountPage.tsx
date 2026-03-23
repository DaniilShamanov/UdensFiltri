"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { authApi } from "@/lib/auth/api";
import { useRouter, usePathname } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { extractErrorMessage, getErrorCode } from "@/lib/api";
import VerificationCodeInput from "@/components/VerificationCodeInput";

const AccountPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading, updateProfile, changeEmail, changePhone, changePassword, signOut } = useApp();
  const t = useTranslations('account');
  const tErrors = useTranslations('errors');

  const displayName = useMemo(() => {
    const fn = user?.first_name?.trim() || "";
    const ln = user?.last_name?.trim() || "";
    const n = `${fn} ${ln}`.trim();
    return n || user?.email || user?.phone || "";
  }, [user]);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [emailCode, setEmailCode] = useState("");
  const [passwordCode, setPasswordCode] = useState("");
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);
  const [awaitingPasswordCode, setAwaitingPasswordCode] = useState(false);
  const [isEmailCodeSending, setIsEmailCodeSending] = useState(false);
  const [isPasswordCodeSending, setIsPasswordCodeSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    if (!user) return;

    setProfile({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
    setNewEmail(user.email || "");
    setNewPhone(user.phone || "");
  }, [user]);

  if (authLoading) return <p>Loading</p>;
  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if(user?.first_name?.trim() === profile.first_name.trim() && user?.last_name?.trim() === profile.last_name.trim()) {
      toast.error(t('toast.profileEqualsPrevious'));
      return;
    }

    try {
      await updateProfile({ first_name: profile.first_name.trim(), last_name: profile.last_name.trim() });
      toast.success(t('toast.profileUpdated'));
    } catch (error) {
      const errorCode = getErrorCode(error);
      let message = t('toast.profileUpdateFailed');
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(message);
    }
  };

  const requestVerificationCode = async ({
    purpose,
    onSending,
    onSent,
    onError,
  }: {
    purpose: 'change_email' | 'change_password';
    onSending: (sending: boolean) => void;
    onSent: () => void;
    onError: (error: unknown) => void;
  }) => {
    if (!user?.email) {
      toast.error(t('toast.emailRequired'));
      return;
    }
    onSending(true);
    try {
      await authApi.sendCode({ email: user.email, purpose });
      onSent();
      toast.success(t('toast.verificationCodeSent'));
    } catch (error) {
      onError(error);
    } finally {
      onSending(false);
    }
  };

  const doChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      toast.error(t('toast.emailRequired'));
      return;
    }

    if (trimmedEmail === user.email) {
      toast.error(t('toast.emailEqualsPrevious'));
      return;
    }

    try {
      if (!awaitingEmailCode) {
        await requestVerificationCode({
          purpose: 'change_email',
          onSending: setIsEmailCodeSending,
          onSent: () => {
            setAwaitingEmailCode(true);
            setEmailCode("");
          },
          onError: (error) => {
            const errorCode = getErrorCode(error);
            let message = t('toast.emailUpdateFailed');
            if (errorCode && tErrors.has(errorCode)) {
              message = tErrors(errorCode);
            }
            toast.error(message);
          },
        });
        return;
      }

      await changeEmail({ new_email: trimmedEmail, code: emailCode.trim() });
      setAwaitingEmailCode(false);
      setEmailCode("");
      toast.success(t('toast.emailUpdated'));
    } catch (error) {
      const errorCode = getErrorCode(error);
      let message = t('toast.emailUpdateFailed');
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(message);
    }
  };

  const doChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();

    if(user?.phone?.trim() === newPhone.trim()) {
      toast.error(t('toast.phoneEqualsPrevious'));
      return;
    }

    try {
      await changePhone({ new_phone: newPhone.trim() });
      toast.success(t('toast.phoneUpdated'));
    } catch (error) {
      const errorCode = getErrorCode(error);
      let message = t('toast.phoneUpdateFailed');
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(message);
    }
  };

  const doChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error(t('toast.passwordTooShort', { min: 6, current: newPassword.length }));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t('toast.passwordsMismatch'));
      return;
    }

    try {
      if (!awaitingPasswordCode) {
        await requestVerificationCode({
          purpose: 'change_password',
          onSending: setIsPasswordCodeSending,
          onSent: () => {
            setAwaitingPasswordCode(true);
            setPasswordCode("");
          },
          onError: (error) => {
            const errorCode = getErrorCode(error);
            let message = t('toast.passwordUpdateFailed');
            if (errorCode && tErrors.has(errorCode)) {
              message = tErrors(errorCode);
            }
            toast.error(message);
          },
        });
        return;
      }

      await changePassword({ new_password: newPassword, code: passwordCode.trim() });
      toast.success(t('toast.passwordUpdated'), { description: t('toast.signInAgain') });
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordCode("");
      setAwaitingPasswordCode(false);
      await signOut();
      router.replace("/auth/sign-in");
    } catch (error) {
      const errorCode = getErrorCode(error);
      let message = t('toast.passwordUpdateFailed');
      if (errorCode && tErrors.has(errorCode)) {
        message = tErrors(errorCode);
      }
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 text-2xl font-bold text-secondary sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground">{t('signedInAs', { name: displayName })}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10">
            <TabsTrigger value="profile" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t('tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="security" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t('tabs.security')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-primary/20 bg-card/95 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/8 to-secondary/8">
                <CardTitle>{t('profile.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={saveProfile} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">{t('profile.firstName')}</Label>
                      <Input
                        id="first_name"
                        value={profile.first_name}
                        onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">{t('profile.lastName')}</Label>
                      <Input
                        id="last_name"
                        value={profile.last_name}
                        onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full cursor-pointer bg-primary hover:bg-primary/90 sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> {t('profile.saveName')}
                  </Button>
                </form>

                <Separator />

                <div className="grid gap-6">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4" /> {t('profile.phone')}
                    </div>
                    <form onSubmit={doChangePhone} noValidate className="mt-4 grid gap-3">
                      <Input
                        id="new_phone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder={t('profile.phonePlaceholder')}
                      />
                      <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90">
                        {t('profile.updatePhone')}
                      </Button>
                    </form>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Mail className="h-4 w-4" /> {t('profile.email')}
                    </div>
                    <form onSubmit={doChangeEmail} noValidate className="mt-4 grid gap-3">
                      <Input
                        id="account_email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => {
                          setAwaitingEmailCode(false);
                          setEmailCode("");
                          setNewEmail(e.target.value);
                        }}
                        placeholder={t('profile.emailPlaceholder')}
                      />

                      {awaitingEmailCode && (
                        <VerificationCodeInput
                          id="email_code"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          label={t('profile.emailCode')}
                          placeholder={t('profile.codePlaceholder')}
                          banner={t('profile.codeBanner')}
                          autoFocus
                        />
                      )}

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90 sm:flex-1" disabled={isEmailCodeSending}>
                          {isEmailCodeSending
                            ? t('profile.sendCode')
                            : awaitingEmailCode
                              ? t('profile.confirmCode')
                              : t('profile.updateEmail')}
                        </Button>
                        {awaitingEmailCode && (
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer sm:flex-1"
                            onClick={() =>
                              requestVerificationCode({
                                purpose: 'change_email',
                                onSending: setIsEmailCodeSending,
                                onSent: () => setEmailCode(""),
                                onError: (error) => {
                                  const errorCode = getErrorCode(error);
                                  let message = t('toast.emailUpdateFailed');
                                  if (errorCode && tErrors.has(errorCode)) {
                                    message = tErrors(errorCode);
                                  }
                                  toast.error(message);
                                },
                              })
                            }
                            disabled={isEmailCodeSending}
                          >
                            {t('profile.sendCode')}
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-primary/20 bg-card/95 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/8 to-secondary/8">
                <CardTitle>{t('security.title')}</CardTitle>
                <CardDescription>{t('security.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={doChangePassword} noValidate className="grid gap-3">
                  <Label htmlFor="new_password">{t('security.newPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setAwaitingPasswordCode(false);
                        setPasswordCode("");
                        setNewPassword(e.target.value);
                      }}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>

                  <Label htmlFor="confirm_new_password">{t('security.confirmNewPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm_new_password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>

                  {awaitingPasswordCode && (
                    <VerificationCodeInput
                      id="password_code"
                      value={passwordCode}
                      onChange={(e) => setPasswordCode(e.target.value)}
                      label={t('security.emailCode')}
                      placeholder={t('security.codePlaceholder')}
                      banner={t('security.codeBanner')}
                      autoFocus
                    />
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90 sm:flex-1" disabled={isPasswordCodeSending}>
                      {isPasswordCodeSending
                        ? t('security.sendCode')
                        : awaitingPasswordCode
                          ? t('security.confirmCode')
                          : t('security.updatePassword')}
                    </Button>
                    {awaitingPasswordCode && (
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer sm:flex-1"
                        onClick={() =>
                          requestVerificationCode({
                            purpose: 'change_password',
                            onSending: setIsPasswordCodeSending,
                            onSent: () => setPasswordCode(""),
                            onError: (error) => {
                              const errorCode = getErrorCode(error);
                              let message = t('toast.passwordUpdateFailed');
                              if (errorCode && tErrors.has(errorCode)) {
                                message = tErrors(errorCode);
                              }
                              toast.error(message);
                            },
                          })
                        }
                        disabled={isPasswordCodeSending}
                      >
                        {t('security.sendCode')}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;