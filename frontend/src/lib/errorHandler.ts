import { toast } from 'sonner';
import { getErrorCode, extractErrorMessage } from './api';

export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  t: (key: string) => string,
  options?: {
    successMessage?: string;
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
  }
): Promise<T | undefined> {
  try {
    const result = await apiCall();
    if (options?.successMessage) {
      toast.success(options.successMessage);
    }
    options?.onSuccess?.(result);
    return result;
  } catch (err: any) {
    const errorCode = getErrorCode(err);
    let message = extractErrorMessage(err, 'An error occurred');
    if (errorCode) {
      const translated = t(errorCode);
      if (translated !== errorCode) {
        message = translated;
      }
    }
    toast.error(message);
    options?.onError?.(err);
    // Re‑throw if the caller needs to handle it further
    throw err;
  }
}