import { appLogger } from "@/lib/logger";

export class ApiError extends Error {
  status: number;
  data: unknown;
  code?: string;

  constructor(status: number, data: unknown, message = "API request failed", code?: string) {
    super(message);
    this.status = status;
    this.data = data;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Extract the error code from an ApiError, if present.
 * The backend should return { "message": "...", "code": "error_code" } for structured errors.
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    if (error.code) return error.code;
    if (error.data && typeof error.data === 'object') {
      const data = error.data as Record<string, unknown>;
      if (typeof data.code === 'string') return data.code;
      if (data.error && typeof data.error === 'object') {
        const nested = data.error as Record<string, unknown>;
        if (typeof nested.code === 'string') return nested.code;
      }
    }
  }
  return undefined;
}

function normalizeApiMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  // Ignore i18n key-like payloads such as "signIn.errors.validation_error";
  // callers can use error code translation fallback instead.
  if (/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(trimmed)) {
    return '';
  }

  // Convert patterns like "invalid_code Invalid or expired code" or
  // "invalid_code: Invalid or expired code" into a clean user-facing message.
  const cleaned = trimmed.replace(/^([a-z][a-z0-9_]*(?:\.[a-z0-9_]+)*)(?:\s*[:\-]\s*|\s+)(.+)$/i, '$2').trim();
  return cleaned || trimmed;
}

export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError) {
    // If data is a string, return it directly
    if (typeof error.data === 'string') {
      return normalizeApiMessage(error.data);
    }
    // If data is an object, try common error response patterns
    if (typeof error.data === 'object' && error.data !== null) {
      const data = error.data as Record<string, unknown>;
      
      // Check for common error field names (prioritize specific messages)
      if (data.message && typeof data.message === 'string') return normalizeApiMessage(data.message);
      if (data.detail && typeof data.detail === 'string') return normalizeApiMessage(data.detail);
      if (data.error && typeof data.error === 'string') return normalizeApiMessage(data.error);
      if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        return data.non_field_errors.map(e => normalizeApiMessage(String(e))).join(' ');
      }
      
      // Recursively collect all string values from nested structures
      const messages: string[] = [];
      const genericMessages: string[] = [];
      
      const collectMessages = (obj: unknown, depth = 0): void => {
        if (depth > 2) return;
        if (Array.isArray(obj)) {
          obj.forEach((item) => collectMessages(item, depth + 1));
        } else if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach((val) => collectMessages(val, depth + 1));
        } else if (typeof obj === 'string' && obj.trim()) {
          const msg = obj.trim();
          if (!messages.includes(msg) && !genericMessages.includes(msg)) {
            // Separate generic validation messages from specific ones
            if (msg.toLowerCase().includes('validation') || msg.toLowerCase().includes('failed')) {
              genericMessages.push(msg);
            } else {
              messages.push(msg);
            }
          }
        }
      };
      
      collectMessages(data);
      
      // Return specific messages first, fall back to generic if needed
      const normalizedMessages = messages.map(normalizeApiMessage).filter(Boolean);
      const normalizedGenericMessages = genericMessages.map(normalizeApiMessage).filter(Boolean);
      if (normalizedMessages.length > 0) return normalizedMessages.join(' ');
      if (normalizedGenericMessages.length > 0) return normalizedGenericMessages.join(' ');
    }
    // Fall back to error message
    if (error.message && !error.message.includes('Request failed')) return normalizeApiMessage(error.message);
  }
  if (error instanceof Error) return normalizeApiMessage(error.message);
  if (typeof error === 'string') return normalizeApiMessage(error);
  return defaultMessage;
}

type FetchJsonOpts = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
  csrf?: boolean;
  retryOn401?: boolean;
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, "\\$1")}=(.*?)($|;)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// Define the refresh endpoint (adjust to match your Django URL)
const REFRESH_ENDPOINT = '/api/auth/refresh/';

export async function fetchJson<T>(
  path: string,
  opts: FetchJsonOpts = {},
  // internal flag to prevent infinite refresh loops
  _isRetry = false
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers ?? {}),
  };

  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Django CSRF token handling
  if (opts.csrf) {
    const token = getCookie('csrftoken') || getCookie('csrf') || getCookie('csrf_token');
    if (token) headers['X-CSRFToken'] = token;
  }

  appLogger.debug("api.request.start", {
    url,
    method: opts.method ?? "GET",
    csrf: Boolean(opts.csrf),
    retryOn401: opts.retryOn401 !== false,
    isRetry: _isRetry,
  });

  let res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: opts.credentials ?? 'include',
    cache: 'no-store',
  });

  // Handle 401 Unauthorized – attempt token refresh once
  if (res.status === 401 && !_isRetry && opts.retryOn401 !== false) {
    try {
      // Call refresh endpoint (credentials: 'include' sends cookies automatically)
      const refreshRes = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        // Django's simplejwt expects an empty object? Your auth/api sends {}
        body: JSON.stringify({}),
      });

      if (refreshRes.ok) {
        appLogger.info("api.auth.refresh.success", { url });
        // Retry the original request with a flag to prevent infinite loops.
        // If the retry itself throws, propagate that error directly — the refresh
        // succeeded so it's a different issue, not an auth expiry.
        try {
          return await fetchJson(path, opts, true);
        } catch (retryError) {
          // If retry fails after successful refresh, it's a different issue, not auth
          throw retryError;
        }
      } else {
        appLogger.warn("api.auth.refresh.failed", { url, status: refreshRes.status });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:auth-expired'));
        }
        throw new ApiError(401, null, 'Session expired. Please log in again.');
      }
    } catch (error) {
      // Re-throw ApiErrors directly
      if (error instanceof ApiError) {
        throw error;
      }
      // For network errors reaching the refresh endpoint, try original request anyway
      // Only dispatch auth-expired if fetch failed (not just server error)
      if (error instanceof TypeError) {
        appLogger.error("api.auth.refresh.network_error", {
          url,
          message: error.message,
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:auth-expired'));
        }
        throw new ApiError(401, null, 'Unable to refresh authentication. Please log in again.');
      }
      // Other errors (e.g., JSON parse) – rethrow as-is
      throw error;
    }  
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    appLogger.warn("api.request.failed", {
      url,
      status: res.status,
      method: opts.method ?? "GET",
    });
    // Keep client console clean for expected validation failures (4xx),
    // but still log unexpected server errors in the browser.
    if (typeof window !== "undefined" && res.status >= 500) {
      const headersObj: Record<string,string> = {};
      res.headers.forEach((v,k) => (headersObj[k] = v));
      console.error('[fetchJson] server error response', {
        url,
        status: res.status,
        headers: headersObj,
        data,
        opts,
      });
    }
    throw new ApiError(res.status, data, `Request failed: ${res.status}`);
  }

  appLogger.debug("api.request.success", {
    url,
    status: res.status,
    method: opts.method ?? "GET",
  });
  return data as T;
}
