import type { User } from "../../types/user";

export type AdminTab = "users" | "messages";

export const ROLE_RANK = { user: 0, admin: 1, owner: 2 } as const;

export function getStatusBadgeClass(status: User["status"]) {
  if (status === "Banned") return "badge-error";
  if (status === "Locked") return "badge-warning";
  return "badge-success";
}

export function formatName(user: Pick<User, "firstName" | "lastName" | "email">) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
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

