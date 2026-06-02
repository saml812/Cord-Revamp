import { Server } from "socket.io";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

const userSocketMap = {}; // { [userId: string]: socketId }
const ADMINS_ROOM = "admins";
const OWNERS_ROOM = "owners";

/** @type {import("socket.io").Server | null} */
let io = null;

export function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: [ENV.CLIENT_URL],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const displayName =
      socket.user?.firstName || socket.user?.lastName
        ? `${socket.user?.firstName ?? ""} ${socket.user?.lastName ?? ""}`.trim()
        : socket.user?.email;
    console.log("A user connected", displayName);

    const userId = socket.userId;
    if (userId) userSocketMap[userId] = socket.id;

    if (socket.user?.role === "admin") socket.join(ADMINS_ROOM);
    if (socket.user?.role === "owner") socket.join(OWNERS_ROOM);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", displayName);
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  return io;
}

export function getAdminsRoomName() {
  return ADMINS_ROOM;
}

export function getOwnersRoomName() {
  return OWNERS_ROOM;
}