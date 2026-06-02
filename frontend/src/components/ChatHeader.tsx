import { XIcon } from "lucide-react";
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
    <div
      className="flex justify-between items-center bg-base-100 border-b border-base-500/50 max-h-[105px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={fullName || "User"} />
          </div>
        </div>

        <div>
          <h3 className="text-base-content font-medium">{fullName || "Unknown user"}</h3>
          <p className="text-base-content/60 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <button onClick={() => setSelectedUser(null)} type="button">
        <XIcon className="w-5 h-5 text-base-content/60 hover:text-base-content transition-colors cursor-pointer" />
      </button>
    </div>
  );
}
export default ChatHeader;