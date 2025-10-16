import { authHttp, authHttpTyped } from "./httpClient";
import type {
  LoginRequest,
  LoginResponse,
} from "@/features/auth/DTOs/auth.interfaces";
import { tokenStorage } from "@/shared/tokenStorage";
import { TypedResult } from "@/shared/types";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await authHttp.post<LoginResponse>("/Login", payload);

  if (data?.token) {
    tokenStorage.set(data.token);
  }

  return data;
}

export async function loginTyped(
  payload: LoginRequest
): Promise<TypedResult<LoginResponse>> {
  const result = await authHttpTyped.post<LoginResponse>("/Login", payload);

  if (result.isSuccess && result.data?.token) {
    tokenStorage.set(result.data.token);
  }

  return result;
}

export async function refreshToken(refreshToken: string) {
  const response = await authHttp.post("/RefreshToken", { refreshToken });
  return response;
}

export function logout() {
  tokenStorage.clear();
}
