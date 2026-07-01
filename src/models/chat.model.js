import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Chat must contain exactly 2 participants"
      }
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({
  participants: 1,
});

chatSchema.pre("save", function (next) {
  this.participants.sort();
  next();
});

export const Chat = mongoose.model("Chat", chatSchema);