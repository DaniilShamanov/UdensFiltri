import { User } from '@/lib/types';
import { ApiError } from '@/lib/api';
import { appLogger } from '@/lib/logger';

// Base URL for Django API – falls back to empty string (same origin) if not set
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Helper to build the full URL
const apiUrl = (path: string) => `${API_BASE}${path}`;

export const AUTH_ENDPOINTS = {
  me: "/api/auth/me/",
  profile: "/api/auth/profile/",
  signIn: "/api/auth/login/",
  signUp: "/api/auth/register/",
  signOut: "/api/auth/logout/",
  refresh: "/api/auth/refresh/",
  changeEmail: "/api/auth/change-email/",
  changePhone: "/api/auth/change-phone/",
  changePassword: "/api/auth/change-password/",
  resetPassword: "/api/auth/reset-password/",
  sendCode: "/api/auth/send-code/",
  resendCode: "/api/auth/resend-code/",
} as const;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new ApiError(res.status, null, `Request failed: ${res.status}`);
    }

    // Extract message and code from the new unified format
    let message = errorData.message;
    let code = errorData.code;
    // Fallback for old nested format
    if (!message && errorData.error?.message) message = errorData.error.message;
    if (!code && errorData.error?.code) code = errorData.error.code;

    if (!message) message = 'Request failed';
    if (!code) code = 'request_error';

    appLogger.warn('auth.api.response.failed', { status: res.status, message, code });
    throw new ApiError(res.status, errorData, message, code);
  }
  return res.json();
}

export const authApi = {
  me: async (): Promise<User> => {
    appLogger.debug('auth.api.me.start');
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.me), {
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  signIn: async (input: { email: string; password: string }) => {
    appLogger.info('auth.api.sign_in.start', { email: input.email });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.signIn), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  signUp: async (input: {
    first_name?: string;
    last_name?: string;
    email: string;
    password: string;
    code: string;
    phone?: string;
  }) => {
    appLogger.info('auth.api.sign_up.start', { email: input.email });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.signUp), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  signOut: async () => {
    appLogger.info('auth.api.sign_out.start');
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.signOut), {
      method: 'POST',
      credentials: 'include',
    });
    await handleResponse(res);
  },

  refresh: async () => {
    appLogger.debug('auth.api.refresh.start');
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.refresh), {
      method: 'POST',
      credentials: 'include',
    });
    await handleResponse(res);
  },

  updateProfile: async (input: { first_name?: string; last_name?: string }) => {
    appLogger.info('auth.api.profile.update.start', { fields: Object.keys(input).join(',') });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.profile), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  changeEmail: async (input: { new_email: string; code: string }) => {
    appLogger.info('auth.api.change_email.start', { new_email: input.new_email });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.changeEmail), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  changePhone: async (input: { new_phone: string }) => {
    appLogger.info('auth.api.change_phone.start');
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.changePhone), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  changePassword: async (input: { new_password: string; code: string }) => {
    appLogger.info('auth.api.change_password.start');
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.changePassword), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    await handleResponse(res);
  },

  resetPassword: async (input: { new_password: string; code: string; email: string }) => {
    appLogger.info('auth.api.reset_password.start', { email: input.email });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.resetPassword), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    await handleResponse(res);
  },

  sendCode: async (input: { email: string; purpose: string }) => {
    appLogger.info('auth.api.send_code.start', { email: input.email, purpose: input.purpose });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.sendCode), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    await handleResponse(res);
  },

  resendCode: async (input: { email: string; purpose: string }) => {
    appLogger.info('auth.api.resend_code.start', { email: input.email, purpose: input.purpose });
    const res = await fetch(apiUrl(AUTH_ENDPOINTS.resendCode), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include',
    });
    await handleResponse(res);
  },
};
