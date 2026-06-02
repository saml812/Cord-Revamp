import { ChevronLeft } from "lucide-react";
import type { User } from "../../types/user";
import { formatName, getStatusBadgeClass } from "./utils";

type Props = {
  user: User;
  onBack?: () => void;
};

export default function AdminUserHeader({ user, onBack }: Props) {
  return (
    <div className="p-4 border-b border-base-300 flex items-center justify-between gap-3 shrink-0">
      {onBack && (
        <button
          type="button"
          className="md:hidden btn btn-ghost btn-sm btn-circle shrink-0"
          onClick={onBack}
          aria-label="Back to user list"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-bold truncate">{formatName(user)}</div>
        <div className="text-xs opacity-70 truncate">{user._id}</div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
        <div className="badge badge-outline badge-sm rounded-lg min-w-[84px] h-7 px-3 justify-center">
          {user.role}
        </div>
        <div
          className={`badge badge-sm rounded-lg min-w-[84px] h-7 px-3 justify-center ${getStatusBadgeClass(
            user.status,
          )} border-base-300`}
        >
          {user.status ?? "Active"}
        </div>
      </div>
    </div>
  );
}

