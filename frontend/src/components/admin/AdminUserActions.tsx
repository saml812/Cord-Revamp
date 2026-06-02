import { useState } from "react";
import type { User } from "../../types/user";
import type { BanInput } from "./types";
import AdminCard from "./AdminCard";
import { canUnbanUser, formatBanUntil, isBanActive } from "./utils";

type Props = {
  authUser: User;
  selectedUser: User;
  canManageSelected: boolean;
  isUserActionLoading: boolean;
  updateUserRole: (userId: string, newRole: User["role"]) => void | Promise<void>;
  lockUser: (userId: string, value: boolean) => void | Promise<void>;
  banUser: (userId: string, input: BanInput) => void | Promise<void>;
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
  const userIsBanned = isBanActive(selectedUser);
  const userCanUnban = canUnbanUser(selectedUser);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AdminCard title="Role">
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
      </AdminCard>

      <AdminCard title="Lock">
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
      </AdminCard>

      <AdminCard
        title="Ban"
        className="md:col-span-2"
        headerRight={
          <div className="text-xs opacity-70">
            Until: <span className="font-mono">{formatBanUntil(selectedUser.banUntil)}</span>
          </div>
        }
      >

        <div className="flex flex-col gap-3">
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
              disabled={isUserActionLoading || !canManageSelected || userIsBanned}
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
              disabled={isUserActionLoading || !canManageSelected || !userCanUnban}
              onClick={() => banUser(selectedUser._id, { value: false })}
            >
              Unban
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Danger zone" className="md:col-span-2">
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
      </AdminCard>
    </div>
  );
}

