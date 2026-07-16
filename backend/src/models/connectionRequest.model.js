import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: {
      values: ["ignored", "interested", "accepted", "rejected"],
      message: `{VALUE} is incorrect status type`,
    },
  },
  ignoredUntil: {
    type: Date,
    default: null,
  },
}, { timestamps: true });


connectionRequestSchema.index(
  { 
    fromUserId: 1, 
    toUserId: 1 
  }, 
  {
    unique: true,
  }
);

// Index for efficient querying of ignored requests
connectionRequestSchema.index({ status: 1, ignoredUntil: 1 });

connectionRequestSchema.pre("validate", function (next) {
  if (this.fromUserId?.equals(this.toUserId)) {
    return next(
      new ApiError(403, "You cannot send a connection request to yourself.")
    );
  }

  // ignoredUntil should exist only for ignored requests
  if (this.status !== "ignored") {
    this.ignoredUntil = null;
  }

  next();
})

export const ConnectionRequest = mongoose.model("connectionRequest", connectionRequestSchema)