import type { AdminUserMessagesResponse } from "../../stores/useAdminStore";
import type { Message, User } from "../../types/user";
import { Loader } from "lucide-react";
import { formatName } from "./utils";

function formatAttachmentLabel(message: Message) {
  return message.attachment?.name ?? message.attachment?.url ?? "Attachment";
}

type Props = {
  selectedUser: User;
  isLoading: boolean;
  data: AdminUserMessagesResponse | null;
};

export default function AdminUserMessages({ selectedUser, isLoading, data }: Props) {
  return (
    <div className="p-4 rounded-xl bg-base-100 border border-base-300">
      <div className="font-semibold mb-3">DM messages</div>
      {isLoading ? (
        <div className="flex items-center gap-2 opacity-70">
          <Loader className="size-4 animate-spin" />
          Loading…
        </div>
      ) : !data ? (
        <div className="opacity-70">No data.</div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm opacity-70">
            Chats: {data.chatCount} • Messages: {data.messageCount}
          </div>

          {data.chats.map((chat) => (
            <div key={chat.partner._id} className="border border-base-300 rounded-xl overflow-hidden">
              <div className="p-3 bg-base-200 flex items-center justify-between">
                <div className="font-semibold truncate">
                  {formatName(chat.partner)}
                  <span className="opacity-60 font-normal"> ({chat.partner.email})</span>
                </div>
                <div className="text-xs opacity-70">
                  Last: {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString() : "—"}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-3 space-y-2 bg-base-100">
                {chat.messages.map((m) => (
                  <div key={m._id} className="text-sm">
                    <div className="opacity-70 text-xs">
                      {m.senderId === selectedUser._id ? "User" : "Partner"} •{" "}
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                    {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                    {m.attachment?.url && (
                      <a className="link" href={m.attachment.url} target="_blank" rel="noreferrer">
                        Attachment: {formatAttachmentLabel(m)}
                      </a>
                    )}
                  </div>
                ))}
                {chat.messages.length === 0 && <div className="opacity-70">No messages.</div>}
              </div>
            </div>
          ))}
          {data.chats.length === 0 && <div className="opacity-70">No chats.</div>}
        </div>
      )}
    </div>
  );
}

