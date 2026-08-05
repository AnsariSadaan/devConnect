import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import membershipAmount from "../utils/constants.js";
import razorpayInstance from '../utils/Razorpay.js';
import { User } from "../models/user.model.js";
import crypto from "crypto";

const paymentController = AsyncHandler(async (req, res) => {

    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    // Validate membership type
    if (!membershipType || !membershipAmount[membershipType]) {
        throw new ApiError(400, "Invalid or missing membershipType");
    }

    const order = await razorpayInstance.orders.create({
        amount: membershipAmount[membershipType] * 100, //in ps
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
            firstName,
            lastName,
            emailId,
            membershipType: membershipType,
            userId: req.user._id.toString(),
        },
    })

    const { id: orderId, status, amount, currency, receipt, notes } = order
    const payment = new Payment({
        userId: req.user._id,
        orderId,
        status,
        amount,
        currency,
        receipt,
        notes
    })

    //save it in database
    const savedPayment = await payment.save();
    if (!savedPayment) {
        throw new ApiError(500, "Failed to save payment in the database");
    }
    //return back my order details to frontend
    return res.status(200).json(new ApiResponse(200, {
        amount,
        currency,
        notes,
        orderId, keyId: process.env.RAZORPAY_KEY_ID
    }, "order created successfully"));


})

const paymentWithWebhook = AsyncHandler(async (req, res) => {
    const webhookSignature = req.get('X-Razorpay-Signature');

    const isWebhokkValid = validateWebhookSignature(
        JSON.stringify(req.body), 
        webhookSignature, 
        process.env.RAZORPAY_WEBHOOK_SECRET
        );

    if (!isWebhokkValid) {
        // console.log("Invalid Webhook Signature");
        throw new ApiError(400, "WebHook Signature is invalid");
    }
    // console.log("Valid Webhook Signature");

    //update the payment in db
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({orderId: paymentDetails.order_id})
    if (!payment) {
      console.error("Payment not found:", paymentDetails.order_id);
      return res.status(404).json({ error: "Payment not found" });
    }
    payment.status = paymentDetails.status;
    await payment.save();
    // console.log("Payment saved");

    // updat the user as premium customer
    const user = await User.findOne({_id: payment.userId});
    if (!user) {
      console.error("User not found:", payment.userId);
      return res.status(404).json({ error: "User not found" });
    }
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    user.premiumSince = new Date();
    
    // Set expiry date based on membership type
    const expiryDate = new Date();
    if (payment.notes.membershipType === 'silver') {
        expiryDate.setMonth(expiryDate.getMonth() + 3); // 3 months
    } else if (payment.notes.membershipType === 'gold') {
        expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months
    }
    user.premiumExpiry = expiryDate;

    await user.save();
    // console.log("User updated to premium:", user._id);

    return res.status(200).json(new ApiResponse(200, {user}, "webhook recieved successfully"));
})

const premiumVerify = AsyncHandler(async (req, res) => {
    // const user = req.user.toJSON();
    // console.log(user);
    // if (user.isPremium) {
    //     return res.json({...user});
    // }
    // return res.json({...user});

  const user = await User.findById(req.user._id).select('-password -refreshToken');
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      user.isPremium = false;
      user.membershipType = null;
      await user.save();
    }
    
    return res.json({
      ...user.toObject(),
      isPremium: user.isPremium || false,
      membershipType: user.membershipType || null,
    });
});

const verifyPayment = AsyncHandler(async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = req.body;

  // Validate request
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment details");
  }

  // Generate signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Verify signature
  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  // Find payment
  const payment = await Payment.findOne({
    orderId: razorpay_order_id,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  // Prevent duplicate verification
  if (payment.status === "paid") {
    return res.status(200).json(
      new ApiResponse(200, payment, "Payment already verified")
    );
  }

  // Update payment
  payment.status = "paid";
  payment.paymentId = razorpay_payment_id;

  await payment.save();

  // Find user
  const user = await User.findById(payment.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Premium activation
  user.isPremium = true;
  user.membershipType = payment.notes.membershipType;
  user.premiumSince = new Date();

  const expiryDate = new Date();

  if (payment.notes.membershipType === "silver") {
    expiryDate.setMonth(expiryDate.getMonth() + 3);
  } else if (payment.notes.membershipType === "gold") {
    expiryDate.setMonth(expiryDate.getMonth() + 6);
  }

  user.premiumExpiry = expiryDate;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { payment, user},"Payment verified successfully")
  );
});

export { paymentController, paymentWithWebhook, premiumVerify, verifyPayment };