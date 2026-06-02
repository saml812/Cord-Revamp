import Message from "../models/message.js";

export function parseBoundedInt(value, { fallback, min = 1, max }) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export function dmThreadFilter(userId, partnerId) {
  return {
    $or: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId },
    ],
  };
}

/** Returns messages oldest → newest (chronological). */
export async function fetchDmThreadPage({ userId, partnerId, limit, before }) {
  const match = {
    ...dmThreadFilter(userId, partnerId),
    ...(before ? { createdAt: { $lt: before } } : {}),
  };

  const [messages, total] = await Promise.all([
    Message.find(match).sort({ createdAt: -1 }).limit(limit),
    Message.countDocuments(dmThreadFilter(userId, partnerId)),
  ]);

  return {
    messages: messages.reverse(),
    total,
    returned: messages.length,
  };
}

export async function countDmThread(userId, partnerId) {
  return Message.countDocuments(dmThreadFilter(userId, partnerId));
}
