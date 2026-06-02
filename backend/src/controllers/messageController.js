import User from "../models/user.js";
import Message from "../models/message.js";

import cloudinary from "../lib/cloudinary.js";
import { getAdminsRoomName, getIO, getOwnersRoomName, getReceiverSocketId } from "../lib/socket.js";

async function uploadBuffer(buffer, { resource_type }) {
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "cord/messages", resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export const getContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsers: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const hasText = Boolean(text && String(text).trim());
    const hasBase64Image = Boolean(image);
    const hasFile = Boolean(req.file);

    if (!hasText && !hasBase64Image && !hasFile) {
      return res.status(400).json({ message: "Text, image, or file is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let attachment;

    if (req.file) {
      const isImage = req.file.mimetype?.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";
      const uploadResponse = await uploadBuffer(req.file.buffer, { resource_type: resourceType });

      attachment = {
        kind: isImage ? "image" : "file",
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        version: uploadResponse.version,
        resourceType: uploadResponse.resource_type,
        format: uploadResponse.format,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      };
    } else if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "cord/messages",
        resource_type: "image",
      });
      attachment = {
        kind: "image",
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        version: uploadResponse.version,
        resourceType: uploadResponse.resource_type,
        format: uploadResponse.format,
        name: "image",
        type: "image/*",
      };
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: hasText ? String(text).trim() : undefined,
      attachment,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Admin panel realtime:
    // - owners can see all message events
    // - admins must not receive owner-involved message events
    getIO().to(getOwnersRoomName()).emit("admin:newMessage", newMessage);
    const senderIsOwner = req.user?.role === "owner";
    const receiver = await User.findById(receiverId).select("role");
    const receiverIsOwner = receiver?.role === "owner";
    if (!senderIsOwner && !receiverIsOwner) {
      getIO().to(getAdminsRoomName()).emit("admin:newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
