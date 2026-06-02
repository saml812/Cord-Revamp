import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { AdminUserMessagesResponse } from "./types";
import type { User } from "../../types/user";
import AdminCard from "./AdminCard";
import AdminPagination from "./AdminPagination";
import AdminLoading from "./AdminLoading";
import AdminChatList from "./AdminChatList";
import AdminConversationView from "./AdminConversationView";
import { formatName } from "./utils";

type Props = {
  selectedUser: User;
  isLoading: boolean;
  data: AdminUserMessagesResponse | null;
  onPrev: () => void;
  onNext: () => void;
};

export default function AdminUserMessages({ selectedUser, isLoading, data, onPrev, onNext }: Props) {
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  useEffect(() => {
    setActivePartnerId(null);
  }, [selectedUser._id]);

  const openChat = useMemo(() => {
    if (!data || !activePartnerId) return null;
    return data.chats.find((c) => c.partner._id === activePartnerId) ?? null;
  }, [data, activePartnerId]);

  const isConversationView = Boolean(activePartnerId && openChat);
  const conversationTitle =
    isConversationView && openChat ? formatName(openChat.partner) : "DM messages";

  return (
    <div className={isConversationView ? "flex-1 min-h-0 flex flex-col min-w-0" : "min-w-0"}>
    <AdminCard
      title={isConversationView ? conversationTitle : "DM messages"}
      className={isConversationView ? "flex flex-col flex-1 min-h-0 !p-3 sm:!p-4" : ""}
      contentClassName={isConversationView ? "flex-1 min-h-0 flex flex-col" : "space-y-3"}
      headerLeft={
        isConversationView ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle shrink-0 -ml-1"
            onClick={() => setActivePartnerId(null)}
            aria-label="Back to chat list"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : undefined
      }
      headerRight={
        <AdminPagination
          onPrev={onPrev}
          onNext={onNext}
          prevDisabled={!data || data.chatsPage <= 1 || isConversationView}
          nextDisabled={!data || !data.chatsTotalPages || data.chatsPage >= data.chatsTotalPages || isConversationView}
        />
      }
    >
      {isLoading ? (
        <AdminLoading />
      ) : !data ? (
        <div className="opacity-70">No data.</div>
      ) : isConversationView && openChat ? (
        <AdminConversationView
          subjectUser={selectedUser}
          chat={openChat}
          messagesLimitPerChat={data.messagesLimitPerChat}
          onBack={() => setActivePartnerId(null)}
        />
      ) : (
        <AdminChatList data={data} onViewChat={setActivePartnerId} />
      )}
    </AdminCard>
    </div>
  );
}
