import { usePathname } from '@/navigation';
import { locales } from '@/i18n/routing';

export function usePathnameWithoutLocale() {
  const pathname = usePathname();
  const localePattern = new RegExp(`^/(?:${locales.join('|')})(/|$)`);

  return pathname.replace(localePattern, '/');
}