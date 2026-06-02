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

const SELECTED_CHAT_USER_ID_KEY = "selectedChatUserId";

interface ChatStore {
  contacts: User[];
  chats: User[];
  messages: Message[];
  activeTab: "chats" | "contacts";
  selectedUser: User | null;
  selectedUserId: string | null;
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
  selectedUserId: localStorage.getItem(SELECTED_CHAT_USER_ID_KEY),
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
  setSelectedUser: (selectedUser: User | null) => {
    const nextId = selectedUser?._id ?? null;
    if (nextId) localStorage.setItem(SELECTED_CHAT_USER_ID_KEY, nextId);
    else localStorage.removeItem(SELECTED_CHAT_USER_ID_KEY);

    set({ selectedUser, selectedUserId: nextId });
  },

  getContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/messages/contacts");
      set({ contacts: res.data });

      // restore selected chat from contacts if needed
      const { selectedUser, selectedUserId } = get();
      if (!selectedUser && selectedUserId) {
        const restored = res.data.find((u) => u._id === selectedUserId);
        if (restored) set({ selectedUser: restored });
      }
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

      // restore selected chat from chats if needed
      const { selectedUser, selectedUserId } = get();
      if (!selectedUser && selectedUserId) {
        const restored = res.data.find((u) => u._id === selectedUserId);
        if (restored) set({ selectedUser: restored });
      }
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
      const { selectedUser, messages, isSoundEnabled } = get();
      if (!selectedUser) return;

      const isForOpenChat =
        newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
      if (!isForOpenChat) return;

      if (messages.some((m) => m._id === newMessage._id)) return;

      set({ messages: [...messages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
