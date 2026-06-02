import type { Message } from "../../types/user";

export function sameId(a: string | undefined, b: string | undefined) {
  return Boolean(a && b && String(a) === String(b));
}

export function formatAttachmentLabel(message: Message) {
  return message.attachment?.name ?? message.attachment?.url ?? "Attachment";
}

/** Preview text for chat list (expects chronological messages, uses last = newest). */
export function lastMessagePreview(messages: Message[]) {
  const last = messages[messages.length - 1];
  if (!last) return "—";
  if (last.text?.trim()) return last.text.trim();
  if (last.attachment?.url) return `Attachment: ${formatAttachmentLabel(last)}`;
  return "—";
}

/** API returns oldest → newest; admin UI displays newest → oldest. */
export function toNewestFirst(messages: Message[]) {
  return [...messages].reverse();
}

export function mergeOlderMessages(
  currentNewestFirst: Message[],
  olderChronological: Message[],
): Message[] {
  const existingIds = new Set(currentNewestFirst.map((m) => m._id));
  const olderNewestFirst = toNewestFirst(olderChronological);
  return [...currentNewestFirst, ...olderNewestFirst.filter((m) => !existingIds.has(m._id))];
}
