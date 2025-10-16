import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginRequest } from "@/features/auth/DTOs/auth.interfaces";
import { decodeUserFromToken } from "@/shared/utils/decodeToken";

export interface AuthUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  imageUrl?: string;
}

import {
  loginTyped,
  logout as logoutApi,
} from "@/features/auth/services/auth.service";
import { tokenStorage } from "@/shared/tokenStorage";

export type LoginResult =
  | { success: true }
  | { success: false; error?: string };

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginRequest) => Promise<LoginResult>;
  logout: () => Promise<void> | void;
  setUser: (u: AuthUser | null) => void;
}


export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = tokenStorage.get();
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      tokenStorage.clear();
      setUser(null);
      return;
    }

    const decoded = decodeUserFromToken(accessToken);
    if (decoded) {
      // Map decoded token to AuthUser, providing defaults for missing fields
      const mappedUser: AuthUser = {
        id: decoded.id,
        name: decoded.name ?? "",
        surname: decoded.surname ?? "",
        email: decoded.email ?? "",
        imageUrl: decoded.imageUrl ?? undefined
      };
      setUser(mappedUser);
    }
  }, []);

  const login = useCallback(
    async (payload: LoginRequest): Promise<LoginResult> => {
      setLoading(true);
      try {
        const result = await loginTyped(payload);

        if (result.isSuccess && result.data) {
          tokenStorage.set(result.data);
          const decoded = decodeUserFromToken(result.data.accessToken);
          if (decoded) {
            const mappedUser: AuthUser = {
              id: decoded.id,
              name: decoded.name ?? "",
              surname: decoded.surname ?? "",
              email: decoded.email ?? "",
              imageUrl: decoded.imageUrl ?? undefined
            };
            setUser(mappedUser);
          }
          return { success: true };
        } else {
          return { success: false, error: result.message };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Authentication error";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await Promise.resolve(logoutApi());
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isLoading: loading,

      login,
      logout,
      setUser,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
