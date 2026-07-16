import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  paymentId: {
    type: String,
    // required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      "created",
      "paid",
      "failed",
      "refunded"
    ]
  },
  amount: {
    type: Number,
    required: true,
  },
  provider: {
    type: String,
    default: "razorpay"
  },
  currency: {
    type: String,
    required: true,
  },
  receipt: {
    type: String,
    required: true,
  },
  notes: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    membershipType: {
      type: String,
    }
  }
}, {
    timestamps: true
  } 
);

paymentSchema.index(
  {
    orderId: 1
  },
  {
    unique: true
  }
);
export const Payment = mongoose.model("Payment", paymentSchema); 