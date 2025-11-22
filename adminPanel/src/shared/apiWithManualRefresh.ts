import { manualRefreshToken } from "@/features/auth/services/auth.service";
import { tokenStorage } from "@/shared/tokenStorage";

/**
 * Wrap any API call to handle 401 errors by refreshing the token and retrying once.
 * @param requestFn Function that returns a Promise for the API call
 */
export async function apiCallWithManualRefresh<T>(requestFn: () => Promise<T>): Promise<T> {
  try {
    const res = await requestFn();
    // If axios response-like object with `.data`, return `.data`, else return as-is
    // @ts-ignore
    return res && typeof (res as any).then !== 'function' && (res as any).data !== undefined ? (res as any).data : res;
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) {
        try {
          const refreshResult = await manualRefreshToken(refreshToken);
          if (refreshResult.isSuccess) {
            // Retry the original request after refreshing token
            const retryRes = await requestFn();
            // @ts-ignore
            return retryRes && typeof (retryRes as any).then !== 'function' && (retryRes as any).data !== undefined ? (retryRes as any).data : retryRes;
          }
        }
        catch (refreshError) {
          console.log("Token refresh failed:", refreshError);
          tokenStorage.remove();
          window.location.href = "/";
        }
      }
    }
    throw error;
  }
}
