import { useState } from "react";
import type { User } from "../../types/user";
import { formatBanUntil } from "./utils";

type Props = {
  authUser: User;
  selectedUser: User;
  canManageSelected: boolean;
  isUserActionLoading: boolean;
  updateUserRole: (userId: string, newRole: User["role"]) => void | Promise<void>;
  lockUser: (userId: string, value: boolean) => void | Promise<void>;
  banUser: (
    userId: string,
    input:
      | { value: false }
      | { value: true; indefinite?: true }
      | { value: true; until: string }
      | { value: true; durationSeconds: number },
  ) => void | Promise<void>;
  deleteUser: (userId: string) => void | Promise<void>;
};

export default function AdminUserActions(props: Props) {
  const {
    authUser,
    selectedUser,
    canManageSelected,
    isUserActionLoading,
    updateUserRole,
    lockUser,
    banUser,
    deleteUser,
  } = props;

  const [banMode, setBanMode] = useState<"indefinite" | "duration">("indefinite");
  const [banSeconds, setBanSeconds] = useState(3600);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-4 rounded-xl bg-base-100 border border-base-300">
        <div className="font-semibold mb-3">Role</div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-sm rounded-xl"
            disabled={isUserActionLoading || selectedUser.role === "user" || !canManageSelected}
            onClick={() => updateUserRole(selectedUser._id, "user")}
          >
            Set user
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary rounded-xl"
            disabled={isUserActionLoading || selectedUser.role === "admin" || !canManageSelected}
            onClick={() => updateUserRole(selectedUser._id, "admin")}
          >
            Set admin
          </button>
          {authUser.role === "owner" && (
            <button
              type="button"
              className="btn btn-sm rounded-xl"
              disabled={isUserActionLoading || selectedUser.role === "owner" || !canManageSelected}
              onClick={() => updateUserRole(selectedUser._id, "owner")}
            >
              Set owner
            </button>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-base-100 border border-base-300">
        <div className="font-semibold mb-3">Lock</div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-sm rounded-xl"
            disabled={isUserActionLoading || selectedUser.isLocked === true || !canManageSelected}
            onClick={() => lockUser(selectedUser._id, true)}
          >
            Lock
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-xl"
            disabled={isUserActionLoading || selectedUser.isLocked !== true || !canManageSelected}
            onClick={() => lockUser(selectedUser._id, false)}
          >
            Unlock
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-base-100 border border-base-300 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Ban</div>
          <div className="text-xs opacity-70">
            Until: <span className="font-mono">{formatBanUntil(selectedUser.banUntil)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-xl ${banMode === "indefinite" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setBanMode("indefinite")}
            >
              Indefinite
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-xl ${banMode === "duration" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setBanMode("duration")}
            >
              Duration
            </button>
          </div>

          {banMode === "duration" && (
            <label className="input input-bordered flex items-center gap-2 w-full max-w-sm">
              <span className="text-sm opacity-70">Seconds</span>
              <input
                className="grow"
                type="number"
                min={1}
                value={banSeconds}
                onChange={(e) => setBanSeconds(Number(e.target.value))}
              />
            </label>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-error rounded-xl"
              disabled={isUserActionLoading || !canManageSelected}
              onClick={() =>
                banUser(
                  selectedUser._id,
                  banMode === "duration"
                    ? { value: true, durationSeconds: banSeconds }
                    : { value: true, indefinite: true },
                )
              }
            >
              Ban
            </button>
            <button
              type="button"
              className="btn btn-sm rounded-xl"
              disabled={isUserActionLoading || !canManageSelected}
              onClick={() => banUser(selectedUser._id, { value: false })}
            >
              Unban
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-base-100 border border-base-300 md:col-span-2">
        <div className="font-semibold mb-3">Danger zone</div>
        <button
          type="button"
          className="btn btn-sm btn-outline btn-error rounded-xl"
          disabled={isUserActionLoading || !canManageSelected}
          onClick={() => {
            const ok = window.confirm(
              `Delete account for ${selectedUser.email}?\n\nThis cannot be undone.`,
            );
            if (!ok) return;
            deleteUser(selectedUser._id);
          }}
        >
          Delete user
        </button>
        <div className="text-xs opacity-70 mt-2">Note: you can only manage accounts below your role.</div>
      </div>
    </div>
  );
}

