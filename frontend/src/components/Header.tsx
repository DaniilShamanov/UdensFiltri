"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart, User, Droplet, LogOut, Package, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import CategoryNav from "@/components/CategoryNav";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import NotificationBanner from "@/components/NotificationBanner";
import { Link, usePathname, useRouter } from "@/navigation";

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    cart,
    authLoading,
    routeLoading,
    authNotice,
    clearAuthNotice,
    signOut,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount =
    cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/services", label: t("nav.services") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      {routeLoading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/45 backdrop-blur-[1px]">
          <div className="h-12 w-12 rounded-full border-4 border-primary/25 border-t-primary animate-spin shadow-lg" />
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-gradient-to-r from-background/95 via-primary/5 to-secondary/10 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-[0_10px_28px_rgba(11,99,206,0.14)]">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-95 md:gap-3"
              aria-label="Home"
            >
              <div className="bg-gradient-to-br from-secondary via-primary to-accent p-2 rounded-xl shadow-md shadow-primary/25">
                <Droplet className="h-8 w-8 text-white" />
              </div>

              <div className="hidden sm:block">
                <div className="font-bold text-base sm:text-xl text-secondary tracking-tight">
                  WaterFilters
                </div>
                <div className="text-xs text-muted-foreground">
                  Pure Water Solutions
                </div>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className="cursor-pointer rounded-xl text-foreground/90 hover:bg-primary hover:text-primary-foreground"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1 sm:gap-2">

              <LocaleSwitcher />

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-primary/15 lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[320px] bg-background/95 p-0">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>

                  <nav className="mt-6 flex flex-col border-y">
                    {navLinks.map((link) => (
                      <Button
                        key={link.href}
                        asChild
                        variant="ghost"
                        className="justify-start rounded-none border-b px-4 py-6"
                        onClick={closeMobile}
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    ))}


                    {user ? (
                      <>
                        <Button
                          asChild
                          variant="ghost"
                          className="justify-start rounded-none border-b px-4 py-6"
                          onClick={closeMobile}
                        >
                          <Link href="/account">
                            {t("nav.account")}
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          className="justify-start rounded-none border-b px-4 py-6"
                          onClick={closeMobile}
                        >
                          <Link href="/orders">
                            {t("nav.orders")}
                          </Link>
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start rounded-none border-b px-4 py-6 text-destructive"
                          onClick={async () => {
                            await handleLogout();
                            closeMobile();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {t("nav.signOut")}
                        </Button>
                      </>
                    ) : (
                      <Button asChild className="mx-4 my-4 justify-center" onClick={closeMobile}>
                        <Link href="/auth/sign-in">
                          {t("nav.signIn")}
                        </Link>
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Cart */}
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-primary/15 hover:text-primary"
                aria-label={t("nav.cart")}
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />

                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User menu */}
              <div className="relative">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-primary/15 hover:text-primary"
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onSelect={() => router.push("/account")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        {t("nav.account")}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => router.push("/orders")}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {t("nav.orders")}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onSelect={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nav.signOut")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-primary/15 hover:text-primary"
                    onClick={() => router.push("/auth/sign-in")}
                    aria-busy={authLoading}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {pathname === "/products" && <CategoryNav />}
      </header>
    </>
  );
}