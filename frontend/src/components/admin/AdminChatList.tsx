import type { AdminUserMessagesResponse } from "./types";
import { formatName } from "./utils";
import { lastMessagePreview } from "./messageUtils";

type Props = {
  data: AdminUserMessagesResponse;
  onViewChat: (partnerId: string) => void;
};

export default function AdminChatList({ data, onViewChat }: Props) {
  return (
    <>
      <div className="text-xs sm:text-sm opacity-70 flex flex-wrap gap-x-3 gap-y-1">
        <span>Chats: {data.chatCount}</span>
        <span>
          Messages: {data.returnedMessageCount} / {data.totalMessageCount}
        </span>
        <span>
          Page {data.chatsPage} / {data.chatsTotalPages}
        </span>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {data.chats.map((chat) => (
          <button
            key={chat.partner._id}
            type="button"
            className="w-full text-left p-3 rounded-xl border border-base-300 bg-base-200/50 hover:bg-base-200 transition-colors"
            onClick={() => onViewChat(chat.partner._id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{formatName(chat.partner)}</div>
                <div className="text-xs opacity-70 truncate">{chat.partner.email}</div>
              </div>
              <span className="badge badge-sm badge-ghost shrink-0">{chat.messages.length}</span>
            </div>
            <div className="text-xs opacity-70 mt-2">
              {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString() : "No messages yet"}
            </div>
            <div className="text-sm mt-1 line-clamp-2 break-words">{lastMessagePreview(chat.messages)}</div>
          </button>
        ))}
        {data.chats.length === 0 && (
          <div className="text-center opacity-70 py-6">No chats.</div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto max-w-full">
        <table className="table table-zebra table-fixed w-full">
          <thead>
            <tr>
              <th className="w-[260px]">Partner</th>
              <th className="w-auto">Last message</th>
              <th className="w-[140px] text-right">Loaded</th>
              <th className="w-[90px]"></th>
            </tr>
          </thead>
          <tbody>
            {data.chats.map((chat) => (
              <tr key={chat.partner._id}>
                <td className="min-w-0">
                  <div className="font-semibold truncate">{formatName(chat.partner)}</div>
                  <div className="text-xs opacity-70 truncate">{chat.partner.email}</div>
                </td>
                <td className="min-w-0">
                  <div className="text-xs opacity-70">
                    {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString() : "—"}
                  </div>
                  <div className="truncate">{lastMessagePreview(chat.messages)}</div>
                </td>
                <td className="text-right">{chat.messages.length}</td>
                <td className="text-right">
                  <button type="button" className="btn btn-xs rounded-lg" onClick={() => onViewChat(chat.partner._id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {data.chats.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center opacity-70 py-6">
                  No chats.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
