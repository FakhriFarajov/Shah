import { authHttp } from "./httpClient";
import type {
  RegisterRequest,
  RegisterResponse
} from "@/features/account/DTOs/account.interfaces";

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const { data } = await authHttp.post<RegisterResponse>("/Register", payload);
  return data;
}
