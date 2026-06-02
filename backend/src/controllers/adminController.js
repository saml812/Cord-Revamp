import User from "../models/user.js";
import Message from "../models/message.js";
import { getIO, getReceiverSocketId } from "../lib/socket.js";
import AdminAuditLog from "../models/adminAuditLog.js";
import mongoose from "mongoose";
import {
  ALLOWED_ROLES,
  canActOnTarget,
  canViewAuditLogs,
  canViewMessages,
  logAdminAction,
} from "../lib/adminPermissions.js";
import { countDmThread, fetchDmThreadPage, parseBoundedInt } from "../lib/adminMessages.js";

export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ message: "userId and newRole are required" });
    }
    if (userId === req.user?._id?.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }
    if (!ALLOWED_ROLES.has(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!canActOnTarget(req.user?.role, user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const previousRole = user.role;
    user.role = newRole;
    await user.save();

    await logAdminAction({
      actorId: req.user._id,
      targetId: user._id,
      action: "updateUserRole",
      meta: { actorRole: req.user?.role, targetRole: user.role, previousRole, newRole },
    });

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.log("Error in updateUserRole controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { q, role, status, page = 1, limit = 25 } = req.query;

    const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      const query = String(q).trim();
      filter.$or = [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      data: users,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    console.log("Error in getAllUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const existing = await User.findById(userId);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canActOnTarget(req.user?.role, existing.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await User.findByIdAndDelete(userId);

    await logAdminAction({
      actorId: req.user._id,
      targetId: existing._id,
      action: "deleteUser",
      meta: { actorRole: req.user?.role, targetRole: existing.role, email: existing.email },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in deleteUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const lockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { value, reason } = req.body ?? {};
    const shouldLock = typeof value === "boolean" ? value : true;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot lock your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canActOnTarget(req.user?.role, user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    user.isLocked = shouldLock;
    user.lockUntil = null;
    user.lockReason = shouldLock ? String(reason ?? "") : "";
    user.status = shouldLock ? "Locked" : user.isBanned ? "Banned" : "Active";
    await user.save();

    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      getIO().to(socketId).emit("accountStatusChanged", {
        isLocked: user.isLocked,
        isBanned: user.isBanned,
        banUntil: user.banUntil ?? null,
        lockReason: user.lockReason ?? "",
        status: user.status,
      });
    }

    await logAdminAction({
      actorId: req.user._id,
      targetId: user._id,
      action: shouldLock ? "lockUser" : "unlockUser",
      meta: { actorRole: req.user?.role, targetRole: user.role, reason: user.lockReason ?? "" },
    });

    res.status(200).json({
      message: shouldLock ? "User locked successfully" : "User unlocked successfully",
      user: await User.findById(userId).select("-password"),
    });
  } catch (error) {
    console.log("Error in lockUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { value, until, durationSeconds, indefinite } = req.body ?? {};
    const shouldBan = typeof value === "boolean" ? value : true;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot ban your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canActOnTarget(req.user?.role, user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    if (!shouldBan && !user.isBanned && user.status !== "Banned") {
      return res.status(400).json({ message: "User is not banned" });
    }

    if (shouldBan && user.isBanned) {
      const until = user.banUntil ? new Date(user.banUntil).getTime() : null;
      const banStillActive = until === null || until > Date.now();
      if (banStillActive) {
        return res.status(400).json({ message: "User is already banned" });
      }
    }

    let banUntil = null;
    if (shouldBan) {
      if (indefinite === true) {
        banUntil = null;
      } else if (until !== undefined) {
        const date = new Date(until);
        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid until date" });
        }
        if (date.getTime() <= Date.now()) {
          return res.status(400).json({ message: "until must be in the future" });
        }
        banUntil = date;
      } else if (durationSeconds !== undefined) {
        const seconds = Number(durationSeconds);
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return res.status(400).json({ message: "durationSeconds must be a positive number" });
        }
        banUntil = new Date(Date.now() + seconds * 1000);
      } else {
        // default: indefinite ban
        banUntil = null;
      }
    }

    user.isBanned = shouldBan;
    user.banUntil = shouldBan ? banUntil : null;
    user.status = shouldBan ? "Banned" : user.isLocked ? "Locked" : "Active";
    await user.save();

    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      getIO().to(socketId).emit("accountStatusChanged", {
        isLocked: user.isLocked,
        isBanned: user.isBanned,
        banUntil: user.banUntil ?? null,
        lockReason: user.lockReason ?? "",
        status: user.status,
      });
    }

    await logAdminAction({
      actorId: req.user._id,
      targetId: user._id,
      action: shouldBan ? "banUser" : "unbanUser",
      meta: { actorRole: req.user?.role, targetRole: user.role, banUntil: user.banUntil ?? null },
    });

    res.status(200).json({
      message: shouldBan ? "User banned successfully" : "User unbanned successfully",
      user: await User.findById(userId).select("-password"),
    });
  } catch (error) {
    console.log("Error in banUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    if (!canViewAuditLogs(req.user?.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { page = 1, limit = 25, action, q } = req.query;
    const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (action) filter.action = String(action);
    if (q) {
      const query = String(q).trim();
      filter.$or = [
        { action: { $regex: query, $options: "i" } },
        { "meta.email": { $regex: query, $options: "i" } },
      ];
    }

    // Admins must not see owner-related logs.
    if (req.user?.role === "admin") {
      filter["meta.actorRole"] = { $ne: "owner" };
      filter["meta.targetRole"] = { $ne: "owner" };
    }

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate("actorId", "email firstName lastName role")
        .populate("targetId", "email firstName lastName role"),
      AdminAuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      data: logs,
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    console.log("Error in getAuditLogs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const target = await User.findById(userId).select("role");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canViewMessages(req.user?.role, target.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { chatPage = 1, chatLimit = 10, messagesLimitPerChat = 25 } = req.query;
    const parsedChatLimit = Math.min(Math.max(Number(chatLimit) || 10, 1), 50);
    const parsedChatPage = Math.max(Number(chatPage) || 1, 1);
    const parsedMessagesLimit = Math.min(Math.max(Number(messagesLimitPerChat) || 25, 1), 200);
    const skip = (parsedChatPage - 1) * parsedChatLimit;

    // Find chat partners sorted by latest message timestamp, paginated.
    const match = {
      $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
    };

    const partnerAgg = await Message.aggregate([
      { $match: match },
      {
        $project: {
          senderId: 1,
          receiverId: 1,
          createdAt: 1,
          partnerId: { $cond: [{ $eq: ["$senderId", userObjectId] }, "$receiverId", "$senderId"] },
        },
      },
      {
        $group: {
          _id: "$partnerId",
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      { $skip: skip },
      { $limit: parsedChatLimit },
    ]);

    const totalChatsAgg = await Message.aggregate([
      { $match: match },
      {
        $project: {
          partnerId: {
            $cond: [{ $eq: ["$senderId", userObjectId] }, "$receiverId", "$senderId"],
          },
        },
      },
      { $group: { _id: "$partnerId" } },
      { $count: "total" },
    ]);

    const chatCount = totalChatsAgg?.[0]?.total ?? 0;

    const partnerIds = partnerAgg.map((p) => p._id);
    const partners = await User.find({ _id: { $in: partnerIds } }).select("-password");
    const partnerById = new Map(partners.map((p) => [p._id.toString(), p]));
    const lastAtByPartner = new Map(partnerAgg.map((p) => [p._id.toString(), p.lastMessageAt ?? null]));

    const chats = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const pid = partnerId.toString();
        const { messages } = await fetchDmThreadPage({
          userId: userObjectId,
          partnerId,
          limit: parsedMessagesLimit,
        });

        return {
          partner: partnerById.get(pid) ?? { _id: pid },
          lastMessageAt: lastAtByPartner.get(pid) ?? null,
          messages,
        };
      }),
    );

    const returnedMessageCount = chats.reduce((sum, c) => sum + (c.messages?.length ?? 0), 0);
    const totalMessageCount = await Message.countDocuments(match);

    res.status(200).json({
      userId,
      chatCount,
      chatsPage: parsedChatPage,
      chatsLimit: parsedChatLimit,
      chatsTotalPages: Math.ceil(chatCount / parsedChatLimit),
      messagesLimitPerChat: parsedMessagesLimit,
      totalMessageCount,
      returnedMessageCount,
      chats,
    });
  } catch (error) {
    console.log("Error in getUserMessages controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { userId, partnerId } = req.params;
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(partnerId)) {
      return res.status(400).json({ message: "Invalid userId or partnerId" });
    }

    const target = await User.findById(userId).select("role");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canViewMessages(req.user?.role, target.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const my = new mongoose.Types.ObjectId(userId);
    const partner = new mongoose.Types.ObjectId(partnerId);

    if (String(req.query.countOnly) === "true") {
      const total = await countDmThread(my, partner);
      return res.status(200).json({ userId, partnerId, total });
    }

    const { before, limit = 25 } = req.query;
    const parsedLimit = parseBoundedInt(limit, { fallback: 25, max: 200 });

    const beforeDate = before ? new Date(String(before)) : undefined;
    if (before && Number.isNaN(beforeDate.getTime())) {
      return res.status(400).json({ message: "Invalid before cursor" });
    }

    const { messages, total, returned } = await fetchDmThreadPage({
      userId: my,
      partnerId: partner,
      limit: parsedLimit,
      before: beforeDate,
    });

    res.status(200).json({
      userId,
      partnerId,
      limit: parsedLimit,
      returned,
      total,
      messages,
    });
  } catch (error) {
    console.log("Error in getConversationMessages controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};