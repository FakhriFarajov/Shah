import { authHttp, authHttpTyped } from "./httpClient";
import type { LoginRequest, LoginResponse } from "@/features/auth/DTOs/auth.interfaces";
import { tokenStorage } from "@/shared/tokenStorage";
import { TypedResult } from "@/shared/types";

/** Login using untyped axios */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await authHttp.post<LoginResponse>("/Login", payload);

  if (data?.token) {
    tokenStorage.set(data.token);
  }

  return data;
}

/** Login using typed HTTP client */
export async function loginTyped(
  payload: LoginRequest
): Promise<TypedResult<LoginResponse>> {
  const result = await authHttpTyped.post<LoginResponse>("/Login", payload);

  if (result.isSuccess && result.data?.token) {
    tokenStorage.set(result.data.token);
  }

  return result;
}

/** Logout locally */
export function logout() {
  tokenStorage.clear();
}

/** Manually refresh tokens when a 401 error is detected */
export async function manualRefreshToken(refreshToken: string): Promise<TypedResult<LoginResponse>> {
  const oldAccessToken = tokenStorage.get();
  const result = await authHttp.post<LoginResponse>(
    "/RefreshToken",
    { refreshToken, oldAccessToken }
  );
  if (result.data?.accessToken && result.data?.refreshToken) {
    tokenStorage.set({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
    return TypedResult.success(result.data, "Token refreshed successfully");
  }
  return TypedResult.error("Failed to refresh token", 401);
}
