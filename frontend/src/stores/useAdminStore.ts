import { create } from "zustand";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { axiosInstance } from "../lib/axios";
import type { Message, User } from "../types/user";
import type {
  AdminUserMessagesResponse,
  AuditLogsPage,
  BanInput,
} from "../components/admin/types";
import { fetchAdminAuditLogs, fetchAdminUserMessages } from "./adminApi";
import { sameId } from "../components/admin/messageUtils";

type ApiErrorBody = { message?: string };

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError?.response?.data?.message || fallback;
}

interface AdminState {
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isUserActionLoading: boolean;
  userMessages: AdminUserMessagesResponse | null;
  isUserMessagesLoading: boolean;
  auditLogs: AuditLogsPage | null;
  isAuditLogsLoading: boolean;

  fetchUsers: () => Promise<void>;
  selectUser: (user: User | null) => void;
  refreshSelectedUser: () => Promise<void>;

  updateUserRole: (userId: string, newRole: User["role"]) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  lockUser: (userId: string, value: boolean) => Promise<void>;
  banUser: (userId: string, input: BanInput) => Promise<void>;

  fetchUserMessages: (userId: string, params?: { chatPage?: number }) => Promise<void>;
  clearUserMessages: () => void;
  applyAdminNewMessage: (message: Message) => void;

  fetchAuditLogs: (params?: { page?: number }) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isUserActionLoading: false,
  userMessages: null,
  isUserMessagesLoading: false,
  auditLogs: null,
  isAuditLogsLoading: false,

  fetchUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<{ data: User[] }>("/admin/users");
      set({ users: res.data.data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch users"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  selectUser: (user) => {
    set({ selectedUser: user });
    if (!user) set({ userMessages: null });
  },

  refreshSelectedUser: async () => {
    const selected = get().selectedUser;
    if (!selected) return;
    try {
      const res = await axiosInstance.get<User>(`/admin/user/${selected._id}`);
      set({ selectedUser: res.data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to refresh user"));
    }
  },

  updateUserRole: async (userId, newRole) => {
    set({ isUserActionLoading: true });
    try {
      await axiosInstance.put("/admin/update-role", { userId, newRole });
      toast.success("Role updated");
      await get().fetchUsers();
      await get().refreshSelectedUser();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update role"));
    } finally {
      set({ isUserActionLoading: false });
    }
  },

  deleteUser: async (userId) => {
    set({ isUserActionLoading: true });
    try {
      await axiosInstance.delete(`/admin/user/${userId}`);
      toast.success("User deleted");
      const selected = get().selectedUser;
      if (selected?._id === userId) set({ selectedUser: null, userMessages: null });
      await get().fetchUsers();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to delete user"));
    } finally {
      set({ isUserActionLoading: false });
    }
  },

  lockUser: async (userId, value) => {
    set({ isUserActionLoading: true });
    try {
      await axiosInstance.patch(`/admin/user/${userId}/lock`, { value });
      toast.success(value ? "User locked" : "User unlocked");
      await get().fetchUsers();
      await get().refreshSelectedUser();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update lock"));
    } finally {
      set({ isUserActionLoading: false });
    }
  },

  banUser: async (userId, input) => {
    set({ isUserActionLoading: true });
    try {
      await axiosInstance.patch(`/admin/user/${userId}/ban`, input);
      toast.success(input.value ? "User banned" : "User unbanned");
      await get().fetchUsers();
      await get().refreshSelectedUser();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to update ban"));
    } finally {
      set({ isUserActionLoading: false });
    }
  },

  fetchUserMessages: async (userId, params) => {
    set({ isUserMessagesLoading: true });
    try {
      const chatPage = params?.chatPage ?? 1;
      const data = await fetchAdminUserMessages(userId, chatPage);
      set({ userMessages: data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch user messages"));
    } finally {
      set({ isUserMessagesLoading: false });
    }
  },

  clearUserMessages: () => set({ userMessages: null }),

  applyAdminNewMessage: (message) => {
    const selected = get().selectedUser;
    const current = get().userMessages;
    if (!selected || !current) return;

    const selectedId = selected._id;
    const senderId = message.senderId;
    const receiverId = message.receiverId;
    if (!sameId(senderId, selectedId) && !sameId(receiverId, selectedId)) return;

    if (current.chats.some((c) => c.messages.some((m) => m._id === message._id))) return;

    const partnerId = sameId(senderId, selectedId) ? receiverId : senderId;
    if (!partnerId) return;

    const chatIndex = current.chats.findIndex((c) => sameId(c.partner?._id, partnerId));
    if (chatIndex < 0) return;

    const createdAt = message.createdAt ?? new Date().toISOString();
    const nextChats = current.chats.map((c, i) =>
      i === chatIndex
        ? {
          ...c,
          messages: [...c.messages, message],
          lastMessageAt: createdAt,
        }
        : c,
    );

    nextChats.sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });

    set({
      userMessages: {
        ...current,
        returnedMessageCount: current.returnedMessageCount + 1,
        totalMessageCount: current.totalMessageCount + 1,
        chats: nextChats,
      },
    });
  },

  fetchAuditLogs: async (params) => {
    set({ isAuditLogsLoading: true });
    try {
      const current = get().auditLogs;
      const page = params?.page ?? current?.page ?? 1;
      const data = await fetchAdminAuditLogs(page);
      set({ auditLogs: data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch audit logs"));
    } finally {
      set({ isAuditLogsLoading: false });
    }
  },
}));

export type { AdminUserMessagesResponse, BanInput } from "../components/admin/types";
