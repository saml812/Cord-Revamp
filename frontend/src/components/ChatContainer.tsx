import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import LinkifiedText from "./LinkifiedText";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [isQuickSending, setIsQuickSending] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return <NoChatHistoryPlaceholder name="Select a chat" isDisabled />;
  }

  const selectedUserName =
    `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || "this user";

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${msg.senderId === authUser?._id
                    ? "bg-primary text-primary-content"
                    : "bg-base-100 text-base-content border border-base-300/60"
                    }`}
                >
                  {msg.attachment?.kind === "image" && msg.attachment.url && (
                    <img src={msg.attachment.url} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.attachment?.kind === "file" && msg.attachment.url && (
                    <a
                      href={`http://localhost:3000/api/messages/attachments/${msg._id}/download`}
                      download={msg.attachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className={[
                        "mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        msg.senderId === authUser?._id
                          ? "border-primary-content/30 bg-primary/20"
                          : "border-base-400/50 bg-base-200",
                      ].join(" ")}
                    >
                      <span className="truncate max-w-[220px]">{msg.attachment.name || "Download file"}</span>
                      <span className="opacity-70">↗</span>
                    </a>
                  )}
                  {msg.text && (
                    <LinkifiedText
                      text={msg.text}
                      className="mt-2 whitespace-pre-wrap break-words"
                      linkClassName={
                        msg.senderId === authUser?._id
                          ? "underline underline-offset-2 font-medium hover:opacity-80"
                          : "underline underline-offset-2 text-primary font-medium hover:opacity-80"
                      }
                    />
                  )}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder
            name={selectedUserName}
            isDisabled={isMessagesLoading || isQuickSending}
            onQuickSend={async (text) => {
              try {
                setIsQuickSending(true);
                await sendMessage({ text });
              } finally {
                setIsQuickSending(false);
              }
            }}
          />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;