import type { User } from "../../types/user";
import { UserRound } from "lucide-react";
import { formatName, getStatusBadgeClass } from "./utils";

type Props = {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
};

export default function AdminUserListItem({ user, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isSelected ? "border-primary bg-primary/10" : "border-base-300 hover:bg-base-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 rounded-full bg-base-200">
            {user.profilePic ? (
              <img src={user.profilePic} alt={formatName(user)} />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                <UserRound className="w-5 h-5 opacity-60" />
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{formatName(user)}</div>
          <div className="text-xs opacity-70 truncate">{user.email}</div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end gap-1">
            <div className="badge badge-outline badge-sm rounded-lg min-w-[84px] h-7 px-3 justify-center">
              {user.role}
            </div>
            <div
              className={`badge badge-sm rounded-lg min-w-[84px] h-7 px-3 justify-center ${getStatusBadgeClass(
                user.status,
              )} border-base-300`}
              title={user.status ?? "Active"}
            >
              {user.status ?? "Active"}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

