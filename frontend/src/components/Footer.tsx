import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";

export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t border-secondary/35 bg-gradient-to-r from-secondary to-primary text-white">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="inline-flex rounded-full bg-white/18 px-3 py-1 text-lg font-semibold text-white">{t('brand')}</div>
            <p className="mt-3 max-w-md text-sm text-white/85">
              {t('description')}
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('company')}</div>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/">{t('home')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/products">{t('products')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/services">{t('services')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/contact">{t('contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('help')}</div>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/faq">{t('faq')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/shipping">{t('shipping')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/returns">{t('returns')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/warranty">{t('warranty')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('legal')}</div>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/privacy">{t('privacy')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/terms">{t('terms')}</Link>
              </li>
              <li>
                <Link className="cursor-pointer transition-colors hover:text-accent" href="/info/cookies">{t('cookies')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/25 pt-6 text-xs text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <div>{t('copyright', { year: new Date().getFullYear() })}</div>
          <div>{t('languages')}</div>
        </div>
      </div>
    </footer>
  );
}
