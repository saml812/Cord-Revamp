import { Loader } from "lucide-react";
import type { User } from "../../types/user";
import type { AdminChat } from "./types";
import ConversationMessage from "./ConversationMessage";
import { useAdminConversation } from "./hooks/useAdminConversation";
import { formatName } from "./utils";

type Props = {
  subjectUser: User;
  chat: AdminChat;
  messagesLimitPerChat: number;
  onBack: () => void;
};

export default function AdminConversationView({ subjectUser, chat, messagesLimitPerChat, onBack }: Props) {
  const { messages, hasMoreOlder, isLoadingOlder, loadOlder, onScroll, scrollRef } = useAdminConversation({
    subjectUserId: subjectUser._id,
    chat,
    messagesLimitPerChat,
  });

  const partner = chat.partner;

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-base-300 rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 bg-base-200 space-y-1 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm sm:text-base">DM thread</div>
            <div className="text-xs sm:text-sm mt-1 space-y-1 sm:space-y-0">
              <p className="min-w-0">
                <span className="font-medium">{formatName(subjectUser)}</span>
                <span className="opacity-70 hidden sm:inline"> ({subjectUser.email})</span>
              </p>
              <p className="opacity-60 sm:hidden">↕</p>
              <p className="opacity-60 hidden sm:inline">↔</p>
              <p className="min-w-0">
                <span className="font-medium">{formatName(partner)}</span>
                <span className="opacity-70 hidden sm:inline"> ({partner.email})</span>
              </p>
            </div>
            <div className="text-xs opacity-70 mt-1 sm:hidden truncate">{partner.email}</div>
          </div>
          <button
            className="btn btn-sm rounded-xl shrink-0 hidden md:inline-flex"
            type="button"
            onClick={onBack}
          >
            Back
          </button>
        </div>
        <div className="text-xs opacity-70">Newest at top — scroll down for older history.</div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 min-h-[240px] max-h-[calc(100dvh-18rem)] md:max-h-[28rem] overflow-y-auto p-3 sm:p-4 space-y-3 bg-base-100"
      >
        {messages.length === 0 ? (
          <div className="opacity-70 text-sm text-center py-6">No messages in this thread.</div>
        ) : (
          messages.map((m) => (
            <ConversationMessage key={m._id} message={m} subjectUser={subjectUser} partner={partner} />
          ))
        )}

        {messages.length > 0 && (
          <div className="pt-2 flex flex-col items-center gap-2 border-t border-base-300/60">
            <div className="text-xs opacity-60 text-center">
              {messages.length} message{messages.length === 1 ? "" : "s"} loaded
              {hasMoreOlder ? " · more available below" : " · start of history"}
            </div>
            {(hasMoreOlder || isLoadingOlder) && (
              <button
                type="button"
                className="btn btn-xs btn-outline rounded-lg"
                onClick={() => void loadOlder()}
                disabled={isLoadingOlder}
              >
                {isLoadingOlder ? (
                  <span className="flex items-center gap-1">
                    <Loader className="size-3 animate-spin" />
                    Loading older…
                  </span>
                ) : (
                  "Load older messages"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
