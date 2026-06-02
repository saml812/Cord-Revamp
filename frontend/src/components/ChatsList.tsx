import { useEffect } from "react";
import { useChatStore } from "../stores/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../stores/useAuthStore";

function ChatsList() {
  const { getMyChats, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const isSocketConnected = useAuthStore((s) => s.isSocketConnected);

  useEffect(() => {
    getMyChats();
  }, [getMyChats]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-base-200/60 p-4 rounded-lg cursor-pointer hover:bg-base-200 transition-colors border border-base-300/40 hover:border-base-500/50"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-12 rounded-full overflow-hidden">
                <img
                  src={chat.profilePic || "/avatar.png"}
                  alt={`${chat.firstName} ${chat.lastName}`.trim() || "User"}
                  className="size-full object-cover"
                />
              </div>
              <span
                aria-label={isSocketConnected && onlineUsers.includes(chat._id) ? "Online" : "Offline"}
                className={[
                  "absolute bottom-0 right-0 size-3 rounded-full border-2",
                  "border-base-200/60",
                  isSocketConnected && onlineUsers.includes(chat._id) ? "bg-emerald-500" : "bg-slate-500",
                ].join(" ")}
              />
            </div>
            <h4 className="text-base-content font-medium truncate">{chat.firstName + " " + chat.lastName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;