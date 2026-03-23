import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    credentials: 'include',
  });

  const data = await res.json();

  // Forward the Set-Cookie headers from Django to the browser
  const response = NextResponse.json(data, { status: res.status });
  const setCookies = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      response.headers.append('set-cookie', cookie);
    }
  } else {
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
  }

  return response;
}