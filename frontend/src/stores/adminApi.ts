import { axiosInstance } from "../lib/axios";
import {
  ADMIN_AUDIT_PAGE_SIZE,
  ADMIN_CHAT_PAGE_SIZE,
  ADMIN_CONVERSATION_PAGE_SIZE,
  ADMIN_MESSAGES_PREVIEW_LIMIT,
} from "../components/admin/constants";
import type {
  AdminUserMessagesResponse,
  AuditLogsPage,
  ConversationCountResponse,
  ConversationMessagesResponse,
} from "../components/admin/types";

export function adminUserMessagesUrl(userId: string, chatPage: number) {
  return `/admin/user/${userId}/messages?chatPage=${chatPage}&chatLimit=${ADMIN_CHAT_PAGE_SIZE}&messagesLimitPerChat=${ADMIN_MESSAGES_PREVIEW_LIMIT}`;
}

export async function fetchAdminUserMessages(userId: string, chatPage: number) {
  const res = await axiosInstance.get<AdminUserMessagesResponse>(adminUserMessagesUrl(userId, chatPage));
  return res.data;
}

export async function fetchConversationCount(userId: string, partnerId: string) {
  const res = await axiosInstance.get<ConversationCountResponse>(
    `/admin/user/${userId}/messages/${partnerId}?countOnly=true`,
  );
  return res.data.total ?? 0;
}

export async function fetchConversationOlder(
  userId: string,
  partnerId: string,
  before: string,
  limit = ADMIN_CONVERSATION_PAGE_SIZE,
) {
  const res = await axiosInstance.get<ConversationMessagesResponse>(
    `/admin/user/${userId}/messages/${partnerId}?limit=${limit}&before=${encodeURIComponent(before)}`,
  );
  return res.data;
}

export async function fetchAdminAuditLogs(page: number) {
  const res = await axiosInstance.get<AuditLogsPage>(
    `/admin/audit-logs?page=${page}&limit=${ADMIN_AUDIT_PAGE_SIZE}`,
  );
  return res.data;
}
