import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import type { User, Message, MessageData } from "../types/user";
import { useAuthStore } from "./useAuthStore";

type ApiErrorBody = { message?: string };

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError?.response?.data?.message || fallback;
}

interface ChatStore {
  contacts: User[];
  chats: User[];
  messages: Message[];
  activeTab: "chats" | "contacts";
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;

  toggleSound: () => void;
  setActiveTab: (tab: "chats" | "contacts") => void;
  setSelectedUser: (selectedUser: User | null) => void;

  getContacts: () => Promise<void>;
  getMyChats: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessageData) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  contacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled:
    JSON.parse(localStorage.getItem("isSoundEnabled") || "false") === true,

  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(newValue));
    set({ isSoundEnabled: newValue });
  },

  setActiveTab: (tab: "chats" | "contacts") => set({ activeTab: tab }),
  setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),

  getContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/messages/contacts");
      set({ contacts: res.data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch contacts"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChats: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/messages/chats");
      set({ chats: res.data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to fetch chats"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get<Message[]>(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Something went wrong"));
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: MessageData) => {
    const selectedUser = get().selectedUser;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const hasFile = Boolean(messageData.file);
      const hasBase64Image = Boolean(messageData.image);

      const res = await (hasFile || hasBase64Image
        ? axiosInstance.post<Message>(
          `/messages/send/${selectedUser._id}`,
          (() => {
            const form = new FormData();
            if (messageData.text?.trim()) form.append("text", messageData.text.trim());
            if (messageData.file) form.append("file", messageData.file, messageData.file.name);
            if (messageData.image) form.append("image", messageData.image);
            return form;
          })(),
        )
        : axiosInstance.post<Message>(`/messages/send/${selectedUser._id}`, messageData));
      set({ messages: [...get().messages, res.data] });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to send message"));
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage: Message) => {
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      const isForThisChat =
        newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
      if (!isForThisChat) return;

      if (messages.some((m) => m._id === newMessage._id)) return;
      set({ messages: [...messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
