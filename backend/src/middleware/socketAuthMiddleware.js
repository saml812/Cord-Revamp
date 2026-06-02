import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // Verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // Find the user from db
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    const displayName =
      user.firstName || user.lastName ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : user.email;
    console.log(`Socket authenticated for user: ${displayName} (${user._id})`);

    next();
  } catch (error) {
    next(new Error("Unauthorized - Authentication failed"));
  }
};