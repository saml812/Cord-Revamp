import { VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useChatStore } from "../stores/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const authUser = useAuthStore((s) => s.authUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const isSocketConnected = useAuthStore((s) => s.isSocketConnected);
  const { isSoundEnabled, toggleSound } = useChatStore();
  const isOnline = Boolean(authUser && isSocketConnected && onlineUsers.includes(authUser._id));

  return (
    <div className="p-4 sm:p-6 border-b border-base-500/50 bg-transparent shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="relative">
            <div
              className="size-14 rounded-full overflow-hidden relative group"
            >
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="Your avatar"
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

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-base-content font-medium text-base max-w-[180px] truncate">
              {authUser?.firstName + " " + authUser?.lastName}
            </h3>
            <p className="text-base-content/60 text-xs">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 items-center">
          {/* SOUND TOGGLE BTN */}
          <button
            className="text-base-content/60 hover:text-base-content transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;