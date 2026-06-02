import axios from "axios";
import type { AxiosError } from "axios";

type ApiErrorBody = { message?: string; banUntil?: string | null };

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials:  true,
});

declare global {
  interface WindowEventMap {
    "auth:forceLogout": CustomEvent<{ message: string; status?: number }>;
  }
}

let interceptorsInitialized = false;
let forceLogoutEventFired = false;

function shouldForceLogoutFromError(error: AxiosError<ApiErrorBody>) {
  const status = error.response?.status;
  const message = error.response?.data?.message ?? "";

  if (status === 403 && (message === "Account banned" || message === "Account locked")) return true;
  if (status === 401) return true;
  return false;
}

function isAuthEndpoint(url: string | undefined) {
  if (!url) return false;
  return (
    url.includes("/auth/logout") ||
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/check")
  );
}

function getLogoutMessage(error: AxiosError<ApiErrorBody>) {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  if (status === 403 && message === "Account banned") return "You were banned.";
  if (status === 403 && message === "Account locked") return "Your account was locked.";
  if (status === 401) return "Your session expired. Please log in again.";
  return "Please log in again.";
}

export function initAxiosAuthInterceptors() {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  axiosInstance.interceptors.response.use(
    (res) => res,
    (err: unknown) => {
      const axiosError = err as AxiosError<ApiErrorBody>;
      const url = axiosError?.config?.url;
      if (axiosError && !isAuthEndpoint(url) && shouldForceLogoutFromError(axiosError)) {
        if (forceLogoutEventFired) return Promise.reject(err);
        forceLogoutEventFired = true;
        const message = getLogoutMessage(axiosError);
        const status = axiosError.response?.status;
        window.dispatchEvent(new CustomEvent("auth:forceLogout", { detail: { message, status } }));
      }
      return Promise.reject(err);
    },
  );
}