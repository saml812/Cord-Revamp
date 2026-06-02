import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    attachment: {
      kind: { type: String, enum: ["image", "file"] },
      publicId: { type: String },
      version: { type: Number },
      resourceType: { type: String },
      format: { type: String },
      url: { type: String },
      name: { type: String },
      type: { type: String },
      size: { type: Number },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;