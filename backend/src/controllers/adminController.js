import User from "../models/user.js";
import Message from "../models/message.js";
import { getIO, getReceiverSocketId } from "../lib/socket.js";

const ALLOWED_ROLES = new Set(["user", "admin", "owner"]);
const ROLE_RANK = { user: 0, admin: 1, owner: 2 };

function canActOnTarget(actorRole, targetRole) {
  const a = ROLE_RANK[actorRole] ?? -1;
  const t = ROLE_RANK[targetRole] ?? -1;
  return a > t;
}

function canViewMessages(actorRole, targetRole) {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole === "admin" || targetRole === "user";
  return false;
}

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

    user.role = newRole;
    await user.save();

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.log("Error in updateUserRole controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
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

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in deleteUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const lockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { value } = req.body ?? {};
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
    user.status = shouldLock ? "Locked" : user.isBanned ? "Banned" : "Active";
    await user.save();

    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      getIO().to(socketId).emit("accountStatusChanged", {
        isLocked: user.isLocked,
        isBanned: user.isBanned,
        banUntil: user.banUntil ?? null,
        status: user.status,
      });
    }

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
        status: user.status,
      });
    }

    res.status(200).json({
      message: shouldBan ? "User banned successfully" : "User unbanned successfully",
      user: await User.findById(userId).select("-password"),
    });
  } catch (error) {
    console.log("Error in banUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const target = await User.findById(userId).select("role");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!canViewMessages(req.user?.role, target.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });

    const partnerIdSet = new Set();
    for (const msg of messages) {
      const sender = msg.senderId?.toString();
      const receiver = msg.receiverId?.toString();
      if (sender && sender !== userId) partnerIdSet.add(sender);
      if (receiver && receiver !== userId) partnerIdSet.add(receiver);
    }

    const partnerIds = Array.from(partnerIdSet);
    const partners = await User.find({ _id: { $in: partnerIds } }).select("-password");
    const partnerById = new Map(partners.map((p) => [p._id.toString(), p]));

    const chatsByPartnerId = new Map();
    for (const msg of messages) {
      const sender = msg.senderId?.toString();
      const receiver = msg.receiverId?.toString();
      const partnerId = sender === userId ? receiver : sender;
      if (!partnerId) continue;

      if (!chatsByPartnerId.has(partnerId)) {
        chatsByPartnerId.set(partnerId, []);
      }
      chatsByPartnerId.get(partnerId).push(msg);
    }

    const chats = Array.from(chatsByPartnerId.entries())
      .map(([partnerId, msgs]) => {
        const lastMessageAt = msgs[msgs.length - 1]?.createdAt ?? null;
        return {
          partner: partnerById.get(partnerId) ?? { _id: partnerId },
          lastMessageAt,
          messages: msgs,
        };
      })
      .sort((a, b) => {
        const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bt - at;
      });

    res.status(200).json({
      userId,
      chatCount: chats.length,
      messageCount: messages.length,
      chats,
    });
  } catch (error) {
    console.log("Error in getUserMessages controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};