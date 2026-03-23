"use client";

import { useMemo } from "react";
import { usePathnameWithoutLocale } from "@/hooks/locale";
import { Link } from "@/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";

export default function LocaleSwitcher() {
  const currentLocale = useLocale() as AppLocale;
  const pathname = usePathnameWithoutLocale();

  const items = useMemo(() => {
    return (locales as readonly AppLocale[]).map((l) => ({
      locale: l,
      active: l === currentLocale,
    }));
  }, [currentLocale]);

  return (
    <div className="flex items-center gap-1">
      {items.map(({ locale, active }) => (
        <Button
          key={locale}
          asChild
          variant={active ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-2"
        >
          <Link href={pathname || "/"} locale={locale} aria-current={active ? "page" : undefined}>
            {locale.toUpperCase()}
          </Link>
        </Button>
      ))}
    </div>
  );
}
