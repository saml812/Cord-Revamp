import type { Message } from "../types/user";
import { axiosInstance } from "./axios";

export function getAttachmentDownloadUrl(messageId: string) {
  const base = axiosInstance.defaults.baseURL?.replace(/\/$/, "") ?? "";
  return `${base}/messages/attachments/${messageId}/download`;
}

export function isImageAttachment(attachment: NonNullable<Message["attachment"]>) {
  if (attachment.kind === "image") return true;
  if (attachment.kind === "file") return false;
  if (attachment.type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(attachment.url);
}
