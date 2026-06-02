import AdminAuditLog from "../models/adminAuditLog.js";

export const ALLOWED_ROLES = new Set(["user", "admin", "owner"]);
export const ROLE_RANK = { user: 0, admin: 1, owner: 2 };

export function canActOnTarget(actorRole, targetRole) {
  const a = ROLE_RANK[actorRole] ?? -1;
  const t = ROLE_RANK[targetRole] ?? -1;
  return a > t;
}

export function canViewMessages(actorRole, targetRole) {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole === "admin" || targetRole === "user";
  return false;
}

export function canViewAuditLogs(actorRole) {
  return actorRole === "admin" || actorRole === "owner";
}

export async function logAdminAction({ actorId, targetId, action, meta }) {
  try {
    await AdminAuditLog.create({
      actorId,
      targetId,
      action,
      meta: {
        actorRole: meta?.actorRole,
        targetRole: meta?.targetRole,
        ...meta,
      },
    });
  } catch (e) {
    console.log("Error writing admin audit log", e?.message);
  }
}
