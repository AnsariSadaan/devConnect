import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }
      ],
      validate: {
        validator(users) {
          if (users.length !== 2) return false;

          return users[0].toString() !== users[1].toString();
        },
        message: "Connection must contain exactly 2 users"
      },
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


connectionSchema.pre("save", function (next) {
  this.users.sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );
  next();
});

export const Connection = mongoose.model("Connection", connectionSchema);