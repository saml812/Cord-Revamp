import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../../../types/user";
import type { AdminChat } from "../types";
import {
  ADMIN_CONVERSATION_PAGE_SIZE,
  ADMIN_MESSAGES_PREVIEW_LIMIT,
} from "../constants";
import { mergeOlderMessages, toNewestFirst } from "../messageUtils";
import {
  fetchConversationCount,
  fetchConversationOlder,
} from "../../../stores/adminApi";

type Params = {
  subjectUserId: string;
  chat: AdminChat | null;
  messagesLimitPerChat?: number;
};

export function useAdminConversation({
  subjectUserId,
  chat,
  messagesLimitPerChat = ADMIN_MESSAGES_PREVIEW_LIMIT,
}: Params) {
  const partnerId = chat?.partner._id ?? null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!partnerId || !chat) {
      setMessages([]);
      setHasMoreOlder(false);
      return;
    }

    const initial = toNewestFirst(chat.messages);
    setMessages(initial);
    setHasMoreOlder(false);

    let cancelled = false;
    void (async () => {
      try {
        const total = await fetchConversationCount(subjectUserId, partnerId);
        if (!cancelled) setHasMoreOlder(initial.length < total);
      } catch {
        if (!cancelled) setHasMoreOlder(initial.length >= messagesLimitPerChat);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [partnerId, subjectUserId, messagesLimitPerChat, chat]);

  const loadOlder = useCallback(async () => {
    if (!partnerId || isLoadingOlder || !hasMoreOlder) return;

    const oldest = messages[messages.length - 1]?.createdAt;
    if (!oldest) {
      setHasMoreOlder(false);
      return;
    }

    setIsLoadingOlder(true);
    try {
      const { messages: older, total } = await fetchConversationOlder(
        subjectUserId,
        partnerId,
        oldest,
        ADMIN_CONVERSATION_PAGE_SIZE,
      );

      if (older.length === 0) {
        setHasMoreOlder(false);
        return;
      }

      const merged = mergeOlderMessages(messages, older);
      setMessages(merged);
      setHasMoreOlder(merged.length < total);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [partnerId, subjectUserId, isLoadingOlder, hasMoreOlder, messages]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoadingOlder || !hasMoreOlder) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom) void loadOlder();
  }, [loadOlder, isLoadingOlder, hasMoreOlder]);

  return {
    messages,
    hasMoreOlder,
    isLoadingOlder,
    loadOlder,
    onScroll,
    scrollRef,
  };
}
