import { jwtDecode } from "jwt-decode";
import { tokenStorage } from '@/shared/tokenStorage';

export function getUserIdFromToken(): string | null {
  const token = tokenStorage.get();
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    console.log("Decoded token:", decoded);
    return decoded.seller_profile_id || null;
  } catch {
    return null;
  }
}