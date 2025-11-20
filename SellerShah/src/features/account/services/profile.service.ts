import { authHttp } from "./httpClient";
import type {
  RegisterRequest,
  RegisterResponse,
  ForgetPasswordRequest,
} from "@/features/account/DTOs/account.interfaces";

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await authHttp.post<RegisterResponse>("/Register", payload);
  return data;
}

export async function confirmEmail(): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const { data } = await authHttp.post<{ success: boolean; error?: string }>("/ConfirmEmail");
    return { isSuccess: data.success, message: data.error };
  } catch (error) {
    return { isSuccess: false, message: (error as Error).message };
  }
}

export async function forgotPassword(payload: ForgetPasswordRequest): Promise<{ isSuccess: boolean; message?: string }> {
  try {
    const { data } = await authHttp.post<{ isSuccess: boolean; message?: string }>("/ForgotPassword", payload);
    return data;
  } catch (error) {
    return { isSuccess: false, message: (error as Error).message };
  }
}

