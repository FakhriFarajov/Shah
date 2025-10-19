import { refreshToken } from "@/features/auth/services/auth.service";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tokenStorage } from "@/shared/tokenStorage";
import axios from "axios";
import { createResponseMiddleware } from "@/shared/middlewares";
import { TypedResult, type ApiResponse } from "@/shared/types";

const AUTH_API_KEY = import.meta.env.VITE_AUTH_API || "http://localhost:5298";

export const authHttp = axios.create({
  baseURL: `${AUTH_API_KEY}/api/Buyer/Auth`,
  withCredentials: true,
  timeout: 10000,
});

// Move interceptor setup after declaration
authHttp.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const storedRefreshToken = localStorage.getItem("refresh_token");
      if (storedRefreshToken) {
        try {
          const result = await refreshToken(storedRefreshToken);
          if (result.data?.isSuccess && result.data?.data) {
            tokenStorage.set({
              accessToken: result.data.data.accessToken,
              refreshToken: result.data.data.refreshToken,
            });
            // Retry the original request with new token
            error.config.headers["Authorization"] = `Bearer ${result.data.data.accessToken}`;
            return authHttp.request(error.config);
          }
        } catch (e) {
          tokenStorage.clear();
        }
      }
    }
    return Promise.reject(error);
  }
);

const authResponseMiddleware = createResponseMiddleware({
  onSuccess: (response) => {
    console.log("Auth API Success:", response);
  },
  onError: (response) => {
    if (response.innerStatusCode === 401) {
      tokenStorage.remove();
    }
  },
  onStatusCodeMismatch: (externalStatus, internalStatus) => {
    console.warn(
      `Auth API Status code mismatch - External: ${externalStatus}, Internal: ${internalStatus}`
    );
  },
});

export const authHttpTyped = {
  async get<T>(url: string, config?: any): Promise<TypedResult<T>> {
    try {
      const response = await authHttp.get(url, config);

      return authResponseMiddleware.processResponse<T>(
        response.data as ApiResponse<T>
      );
    } catch (error: any) {
      if (error.response) {
        return authResponseMiddleware.processResponse<T>(
          error.response.data as ApiResponse<T>
        );
      }
      return TypedResult.error<T>(error.message || "Network error", 0);
    }
  },

  async post<T>(
    url: string,
    data?: any,
    config?: any
  ): Promise<TypedResult<T>> {
    try {
      const response = await authHttp.post(url, data, config);

      return authResponseMiddleware.processResponse<T>(
        response.data as ApiResponse<T>
      );
    } catch (error: any) {
      if (error.response) {
        return authResponseMiddleware.processResponse<T>(
          error.response.data as ApiResponse<T>
        );
      }

      return TypedResult.error<T>(error.message || "Network error", 0);
    }
  },

  async put<T>(url: string, data?: any, config?: any): Promise<TypedResult<T>> {
    try {
      const response = await authHttp.put(url, data, config);
      return authResponseMiddleware.processResponse<T>(
        response.data as ApiResponse<T>
      );
    } catch (error: any) {
      if (error.response) {
        return authResponseMiddleware.processResponse<T>(
          error.response.data as ApiResponse<T>
        );
      }
      return TypedResult.error<T>(error.message || "Network error", 0);
    }
  },

  async delete<T>(url: string, config?: any): Promise<TypedResult<T>> {
    try {
      const response = await authHttp.delete(url, config);
      return authResponseMiddleware.processResponse<T>(
        response.data as ApiResponse<T>
      );
    } catch (error: any) {
      if (error.response) {
        return authResponseMiddleware.processResponse<T>(
          error.response.data as ApiResponse<T>
        );
      }
      return TypedResult.error<T>(error.message || "Network error", 0);
    }
  },
};
