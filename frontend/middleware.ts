import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { defaultLocale, localePrefix, locales } from './src/i18n/routing';

const localeArray = locales as readonly string[];
const isDevelopment = process.env.NODE_ENV === 'development';
const SKIP_AUTH_IN_DEV = isDevelopment && process.env.SKIP_AUTH === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const PUBLIC_PREFIXES = ['/home', '/about', '/services', '/auth', '/payment/status'];
const PROTECTED_PREFIXES = ['/account', '/orders', '/payment'];

const intlMiddleware = createMiddleware({ locales, defaultLocale, localePrefix });

async function refreshAccessToken(request: NextRequest, response: NextResponse): Promise<boolean> {
  const refreshToken = request.cookies.get('refresh')?.value;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    });

    if (!res.ok) return false;

    return true;
  } catch {
    return false;
  }
}

async function isAuthenticated(request: NextRequest, response: NextResponse): Promise<boolean> {
  const accessToken = request.cookies.get('access')?.value;

  // If access token exists, treat session as authenticated and let backend validate on API calls.
  if (accessToken) {
    return true;
  }

  // Otherwise try to refresh
  const refreshed = await refreshAccessToken(request, response);
  return refreshed;
}

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  if (SKIP_AUTH_IN_DEV) {
    return response;
  }

  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = extractLocaleFromPath(pathname);

  // Skip public routes
  if (PUBLIC_PREFIXES.some(p => pathWithoutLocale.startsWith(p))) {
    return response;
  }

  // Only check protected routes
  if (!PROTECTED_PREFIXES.some(p => pathWithoutLocale.startsWith(p))) {
    return response;
  }

  const authenticated = await isAuthenticated(request, response);
  if (authenticated) {
    return response;
  }

  // Redirect to login
  const next = encodeURIComponent(pathWithoutLocale + request.nextUrl.search);
  const redirectUrl = new URL(`/${locale || defaultLocale}/auth/sign-in?next=${next}`, request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export const config = {
  matcher: ['/((?!api/trpc|_next/static|_next/image|favicon.ico).*)'],
};

function extractLocaleFromPath(pathname: string): {
  locale: string | null;
  pathWithoutLocale: string;
} {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) return { locale: null, pathWithoutLocale: '/' };
  
  const maybeLocale = parts[0];
  
  if (localeArray.includes(maybeLocale)) {
    return {
      locale: maybeLocale,
      pathWithoutLocale: `/${parts.slice(1).join('/')}` || '/',
    };
  }
  
  return { locale: null, pathWithoutLocale: pathname };
}
