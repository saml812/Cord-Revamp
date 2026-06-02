import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { User, SignupInput, LoginInput } from "../types/user";
import { io, type Socket } from "socket.io-client";
import axios from "axios";

type ApiErrorBody = { message?: string };

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError?.response?.data?.message || fallback;
}

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";

interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: (message?: string) => void;
  updateAuthUser: (user: User) => void;
  onlineUsers: string[];
  isSocketConnected: boolean;
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  onlineUsers: [],
  isSocketConnected: false,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: SignupInput) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create account"));
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginInput) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to log in"));
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to log out"));
    }
  },

  forceLogout: (message) => {
    // Best-effort server logout (clears httpOnly cookie). Use a raw request
    // to avoid triggering axiosInstance interceptors and causing request loops.
    axios
      .post(`${API_BASE_URL}/auth/logout`, null, { withCredentials: true })
      .catch(() => {});
    set({ authUser: null });
    get().disconnectSocket();
    if (message) toast.error(message);
    // Hard redirect to ensure app state is reset.
    window.location.assign("/login");
  },

  updateAuthUser: (user: User) => {
    set({ authUser: user });
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.on("connect", () => {
      set({ isSocketConnected: true });
    });

    socket.on("disconnect", () => {
      set({ isSocketConnected: false, onlineUsers: [] });
    });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    socket.on("accountStatusChanged", (payload: { isLocked?: boolean; isBanned?: boolean }) => {
      if (payload?.isBanned) get().forceLogout("You were banned.");
      else if (payload?.isLocked) get().forceLogout("Your account was locked.");
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (!socket) return;
    socket.off("connect");
    socket.off("disconnect");
    socket.off("getOnlineUsers");
    socket.off("accountStatusChanged");
    socket.disconnect();
    set({ socket: null, onlineUsers: [], isSocketConnected: false });
  },

}));