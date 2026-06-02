import type { User } from "../../types/user";
import type { AdminTab } from "./utils";
import { Loader, Shield } from "lucide-react";
import { formatName } from "./utils";
import AdminUserListItem from "./AdminUserListItem";

type Props = {
  authUser: User;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  query: string;
  setQuery: (value: string) => void;
  isUsersLoading: boolean;
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
};

export default function AdminSidebar(props: Props) {
  const {
    authUser,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    isUsersLoading,
    users,
    selectedUser,
    onSelectUser,
  } = props;

  return (
    <div className="w-96 backdrop-blur-sm flex flex-col bg-base-100 border-r border-base-500/50">
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="font-bold leading-tight">Admin Panel</div>
          <div className="text-xs opacity-70 truncate">Signed in as {formatName(authUser)}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex w-full gap-2">
          <button
            className={`btn btn-sm flex-1 rounded-xl ${activeTab === "users" ? "btn-primary" : "btn-ghost"}`}
            type="button"
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`btn btn-sm flex-1 rounded-xl ${activeTab === "messages" ? "btn-primary" : "btn-ghost"}`}
            type="button"
            onClick={() => setActiveTab("messages")}
            disabled={!selectedUser}
            title={!selectedUser ? "Select a user first" : undefined}
          >
            Messages
          </button>
        </div>

        <label className="input input-bordered w-full rounded-xl flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-primary">
          <input
            className="grow"
            placeholder="Search name, email, id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isUsersLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="size-8 animate-spin opacity-70" />
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((u) => (
              <AdminUserListItem
                key={u._id}
                user={u}
                isSelected={selectedUser?._id === u._id}
                onSelect={() => onSelectUser(u)}
              />
            ))}
            {users.length === 0 && <div className="p-6 text-center opacity-70">No users found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

