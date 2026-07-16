import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { Payment } from "../models/payment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import membershipAmount from "../utils/constants.js";
import razorpayInstance from '../utils/Razorpay.js';
import { User } from "../models/user.model.js";

const paymentController = AsyncHandler(async (req, res) => {

    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    // ✅ Validate membership type
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
        console.log("Invalid Webhook Signature");
        throw new ApiError(400, "WebHook Signature is invalid");
    }
    console.log("Valid Webhook Signature");

    //update the payment in db
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({orderId: paymentDetails.order_id})
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("Payment saved");

    // updat the user as premium customer
    const user = await User.findOne({_id: payment.userId});
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    console.log("User saved");

    return res.status(200).json(new ApiResponse(200, {user}, "webhook recieved successfully"));
})

const premiumVerify = AsyncHandler(async (req, res) => {
    const user = req.user.toJSON();
    console.log(user);
    if (user.isPremium) {
        return res.json({...user});
    }
    return res.json({...user});
});

export { paymentController, paymentWithWebhook, premiumVerify };