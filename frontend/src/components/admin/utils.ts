import type { User } from "../../types/user";
import type { AuditLogUser } from "./types";

export const ROLE_RANK = { user: 0, admin: 1, owner: 2 } as const;

export function getStatusBadgeClass(status: User["status"]) {
  if (status === "Banned") return "badge-error";
  if (status === "Locked") return "badge-warning";
  return "badge-success";
}

export function formatName(user: Pick<User, "firstName" | "lastName" | "email">) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

export function formatUserLabel(user?: AuditLogUser) {
  if (!user) return "—";
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name ? `${name} (${user.email ?? "unknown"})` : (user.email ?? user._id);
}

export function formatBanUntil(value: User["banUntil"]) {
  if (value === undefined) return "—";
  if (value === null) return "Indefinite";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function canManageUser(params: { actor: User; target: User }) {
  const { actor, target } = params;
  return ROLE_RANK[actor.role] > ROLE_RANK[target.role] && actor._id !== target._id;
}

/** True when a ban is in effect (indefinite or not yet expired). */
export function isBanActive(user: Pick<User, "isBanned" | "banUntil">) {
  if (!user.isBanned) return false;
  if (user.banUntil === undefined || user.banUntil === null) return true;
  const until = new Date(user.banUntil).getTime();
  return !Number.isNaN(until) && until > Date.now();
}

/** True when unban is meaningful (banned flag or status still set). */
export function canUnbanUser(user: Pick<User, "isBanned" | "status">) {
  return user.isBanned === true || user.status === "Banned";
}

