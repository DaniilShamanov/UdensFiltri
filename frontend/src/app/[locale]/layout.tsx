import "@/app/globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { locales, type AppLocale } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as AppLocale;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("defaultTitle");
  const description = t("defaultDescription");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale,
    },
    alternates: {
      languages: {
        lv: "/lv",
        ru: "/ru",
        en: "/en",
      },
    },
  };
}

export function generateStaticParams() {
  return (locales as readonly string[]).map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale;
  if (!(locales as readonly string[]).includes(locale)) notFound();

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}