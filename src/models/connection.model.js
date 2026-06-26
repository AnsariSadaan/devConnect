import mongoose from "mongoose";
import validator from 'validator';

const connectionSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        }
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Connection must contain exactly 2 users"
      }
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index(
  {
    users: 1,
  }
);

connectionSchema.pre("save", function (next) {
  this.users.sort();
  next();
});

export const Connection = mongoose.model("Connection", connectionSchema);