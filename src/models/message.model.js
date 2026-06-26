import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text"
    },
    status: {
      type: String,
      enum: [
        "sent",
        "delivered",
        "seen"
      ],
      default: "sent"
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedForEveryone: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  chatId: 1,
  createdAt: -1,
});

export const Message =
  mongoose.model(
    "Message",
    messageSchema
  );