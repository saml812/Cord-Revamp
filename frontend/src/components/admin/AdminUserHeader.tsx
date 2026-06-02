import type { User } from "../../types/user";
import { formatName, getStatusBadgeClass } from "./utils";

export default function AdminUserHeader({ user }: { user: User }) {
  return (
    <div className="p-4 border-b border-base-300 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-bold truncate">{formatName(user)}</div>
        <div className="text-xs opacity-70 truncate">{user._id}</div>
      </div>
      <div className="flex items-center gap-2">
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

