import type { Message, User } from "../../types/user";

export type AdminTab = "users" | "messages" | "audit";

export type BanInput =
  | { value: false }
  | { value: true; indefinite?: true }
  | { value: true; until: string }
  | { value: true; durationSeconds: number };

export type AuditLogUser = {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

export type AuditLogEntry = {
  _id: string;
  action: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  actorId?: AuditLogUser;
  targetId?: AuditLogUser;
};

export type AuditLogsPage = {
  data: AuditLogEntry[];
  page: number;
  totalPages: number;
  total: number;
};

export type AdminChat = {
  partner: User;
  lastMessageAt: string | null;
  messages: Message[];
};

export type AdminUserMessagesResponse = {
  userId: string;
  chatCount: number;
  chatsPage: number;
  chatsLimit: number;
  chatsTotalPages: number;
  messagesLimitPerChat: number;
  totalMessageCount: number;
  returnedMessageCount: number;
  chats: AdminChat[];
};

export type ConversationMessagesResponse = {
  userId: string;
  partnerId: string;
  limit: number;
  returned: number;
  total: number;
  messages: Message[];
};

export type ConversationCountResponse = {
  userId: string;
  partnerId: string;
  total: number;
};
