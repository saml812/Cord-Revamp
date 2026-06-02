import { ChevronLeft, XIcon } from "lucide-react";
import { useChatStore } from "../stores/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const isSocketConnected = useAuthStore((s) => s.isSocketConnected);
  const isOnline = Boolean(selectedUser && isSocketConnected && onlineUsers.includes(selectedUser._id));

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  const fullName = `${selectedUser.firstName} ${selectedUser.lastName}`.trim();

  return (
    <div className="p-4 sm:p-6 border-b border-base-500/50 bg-transparent shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSelectedUser(null)}
            type="button"
            className="md:hidden btn btn-ghost btn-sm btn-circle shrink-0 -ml-1"
            aria-label="Back to chats"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <div className="size-12 sm:size-14 rounded-full overflow-hidden">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={fullName || "User"}
                className="size-full object-cover"
              />
            </div>
            <span
              aria-label={isOnline ? "Online" : "Offline"}
              className={[
                "absolute bottom-0 right-0 size-3 rounded-full border-2",
                "border-base-100",
                isOnline ? "bg-emerald-500" : "bg-slate-500",
              ].join(" ")}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-base-content font-medium text-base truncate">
              {fullName || "Unknown user"}
            </h3>
            <p className="text-base-content/60 text-xs">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          type="button"
          className="hidden md:flex shrink-0 text-base-content/60 hover:text-base-content transition-colors"
          aria-label="Close chat"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;