import * as razorpayUtils from "razorpay/dist/utils/razorpay-utils.js";
import { jest } from "@jest/globals";
import request from "supertest";
import crypto from "crypto";

import app from "../../app.js";

import { User } from "../../models/user.model.js";
import { Payment } from "../../models/payment.model.js";
import membershipAmount from "../../utils/constants.js";

import razorpayInstance from "../../utils/Razorpay.js";


describe("Payment API", () => {
  let user;
  let token;
  let orderId;
  let paymentId;
  let signature;

  beforeEach(async () => {
    await User.deleteMany({});
    await Payment.deleteMany({});

    // Create test user FIRST
    user = await User.create({
      firstName: "Sadaan",
      lastName: "Ansari",
      emailId: "sadaan@test.com",
      password: "Password@123",
      age: 25,
      gender: "male",
      isPremium: false
    });

    token = user.generateAccessToken();
    orderId = "order_test123";
    paymentId = "pay_test123";

    // Generate valid signature for verification
    signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

  // Mock Razorpay order creation
  jest.spyOn(razorpayInstance.orders, "create").mockResolvedValue({
    id: orderId,
    amount: membershipAmount.silver * 100,
    currency: "INR",
    status: "created",
    receipt: `receipt_${Date.now()}`,
    notes: {
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      membershipType: "silver",
      userId: user._id.toString(),
    },
  });

  // Mock Razorpay webhook signature validation
  jest
    .spyOn(razorpayUtils, "validateWebhookSignature")
    .mockReturnValue(true);
    
    razorpayUtils.validateWebhookSignature.mockClear();
  });

    // Mock webhook validation - reset and set default return value
  afterEach( async () => {
    jest.restoreAllMocks();

    await User.deleteMany({});
    await Payment.deleteMany({});
  });


  describe("POST /api/payment/create", () => {
    test("should create silver membership order", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({ membershipType: "silver" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("order created successfully");
      expect(res.body.data.notes.membershipType).toBe("silver");
      expect(res.body.data.amount).toBe(membershipAmount.silver * 100);

      // Verify payment saved in database
      const payment = await Payment.findOne({ orderId: res.body.data.orderId });
      expect(payment).not.toBeNull();
      expect(payment.status).toBe("created");
      expect(payment.amount).toBe(membershipAmount.silver * 100);
      expect(payment.notes.membershipType).toBe("silver");
    });

    test("should create gold membership order", async () => {
      razorpayInstance.orders.create.mockResolvedValueOnce({
        id: `order_gold_${Date.now()}`,
        amount: membershipAmount.gold * 100,
        currency: "INR",
        status: "created",
        receipt: `receipt_${Date.now()}`,
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          emailId: user.emailId,
          membershipType: "gold",
          userId: user._id.toString()
        }
      });

      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({ membershipType: "gold" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes.membershipType).toBe("gold");
      expect(res.body.data.amount).toBe(membershipAmount.gold * 100);

      // Verify payment saved in database
      const payment = await Payment.findOne({ orderId: res.body.data.orderId });
      expect(payment).not.toBeNull();
      expect(payment.status).toBe("created");
      expect(payment.notes.membershipType).toBe("gold");
    });

    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .send({ membershipType: "silver" });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject invalid membership type", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({ membershipType: "invalid" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or missing membershipType");
    });

    test("should reject missing membership type", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or missing membershipType");
    });

    test("should save payment in database", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({ membershipType: "silver" });

      expect(res.statusCode).toBe(200);

      const payment = await Payment.findOne({ orderId: res.body.data.orderId });
      expect(payment).not.toBeNull();
      expect(payment.userId.toString()).toBe(user._id.toString());
      expect(payment.status).toBe("created");
      expect(payment.amount).toBe(membershipAmount.silver * 100);
      expect(payment.currency).toBe("INR");
      expect(payment.notes.membershipType).toBe("silver");
      expect(payment.notes.userId).toBe(user._id.toString());
    });

    test("should return razorpay order details", async () => {
      const res = await request(app)
        .post("/api/payment/create")
        .set("Cookie", `accessToken=${token}`)
        .send({ membershipType: "silver" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("orderId");
      expect(res.body.data).toHaveProperty("amount");
      expect(res.body.data).toHaveProperty("currency");
      expect(res.body.data).toHaveProperty("keyId");
      expect(res.body.data).toHaveProperty("notes");
      expect(res.body.data.notes).toHaveProperty("firstName");
      expect(res.body.data.notes).toHaveProperty("lastName");
      expect(res.body.data.notes).toHaveProperty("emailId");
      expect(res.body.data.notes).toHaveProperty("membershipType");
      expect(res.body.data.notes).toHaveProperty("userId");
    });
  });

  describe("POST /api/payment/verify", () => {
    let savedPayment;

    beforeEach(async () => {
      // Create a payment in database
      savedPayment = await Payment.create({
        userId: user._id,
        orderId: orderId,
        status: "created",
        amount: membershipAmount.silver * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: "silver",
          userId: user._id.toString()
        }
      });
    });

    test("should verify payment successfully", async () => {
      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Payment verified successfully");
      expect(res.body.data.payment.status).toBe("paid");
      expect(res.body.data.payment.paymentId).toBe(paymentId);

      // Verify payment updated in database
      const updatedPayment = await Payment.findOne({ orderId });
      expect(updatedPayment.status).toBe("paid");
      expect(updatedPayment.paymentId).toBe(paymentId);

      // Verify premium activation
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isPremium).toBe(true);
      expect(updatedUser.membershipType).toBe("silver");
      expect(updatedUser.premiumSince).toBeDefined();
      expect(updatedUser.premiumExpiry).toBeDefined();
    });

    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .post("/api/payment/verify")
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should reject missing payment details", async () => {
      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId
          // Missing signature
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Missing payment details");
    });

    test("should reject invalid signature", async () => {
      const invalidSignature = "invalid_signature";

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: invalidSignature
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Payment verification failed");
    });

    test("should return 404 when payment not found", async () => {
      const nonExistentOrderId = "order_not_found";
      const sig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
        .update(`${nonExistentOrderId}|${paymentId}`)
        .digest("hex");

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: nonExistentOrderId,
          razorpay_signature: sig
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Payment not found");
    });

    test("should return 404 when user not found", async () => {
      // Delete the user
      await User.findByIdAndDelete(user._id);

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User not found");
    });

    test("should activate silver membership", async () => {
      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isPremium).toBe(true);
      expect(updatedUser.membershipType).toBe("silver");
      expect(updatedUser.premiumSince).toBeDefined();
      expect(updatedUser.premiumExpiry).toBeDefined();

      // Verify silver expiry (3 months)
      const expiryDate = new Date(updatedUser.premiumExpiry);
      const now = new Date();
      const monthDiff = (expiryDate.getFullYear() - now.getFullYear()) * 12 + 
                       (expiryDate.getMonth() - now.getMonth());
      expect(monthDiff).toBe(3);
    });

    test("should activate gold membership", async () => {
      // Create gold payment
      const goldOrderId = "order_gold_test";
      await Payment.create({
        userId: user._id,
        orderId: goldOrderId,
        status: "created",
        amount: membershipAmount.gold * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: "gold",
          userId: user._id.toString()
        }
      });

      const goldPaymentId = "pay_gold_test";
      const goldSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
        .update(`${goldOrderId}|${goldPaymentId}`)
        .digest("hex");

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: goldPaymentId,
          razorpay_order_id: goldOrderId,
          razorpay_signature: goldSignature
        });

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isPremium).toBe(true);
      expect(updatedUser.membershipType).toBe("gold");

      // Verify gold expiry (6 months)
      const expiryDate = new Date(updatedUser.premiumExpiry);
      const now = new Date();
      const monthDiff = (expiryDate.getFullYear() - now.getFullYear()) * 12 + 
                       (expiryDate.getMonth() - now.getMonth());
      expect(monthDiff).toBe(6);
    });

    test("should prevent duplicate verification", async () => {
      // First verification
      await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      // Second verification attempt
      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", `accessToken=${token}`)
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Payment already verified");
    });
  });

  describe("GET /api/premium/verify", () => {
    test("should reject unauthorized request", async () => {
      const res = await request(app)
        .get("/api/premium/verify");

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return free user", async () => {
      const res = await request(app)
        .get("/api/premium/verify")
        .set("Cookie", `accessToken=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isPremium).toBe(false);
      expect(res.body.membershipType).toBeNull();
      expect(res.body).toHaveProperty("firstName");
      expect(res.body).toHaveProperty("lastName");
      expect(res.body).toHaveProperty("emailId");
      expect(res.body).not.toHaveProperty("password");
      expect(res.body).not.toHaveProperty("refreshToken");
    });

    test("should return premium user", async () => {
      user.isPremium = true;
      user.membershipType = "silver";
      user.premiumSince = new Date();
      user.premiumExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      await user.save();

      const premiumToken = user.generateAccessToken();

      const res = await request(app)
        .get("/api/premium/verify")
        .set("Cookie", `accessToken=${premiumToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isPremium).toBe(true);
      expect(res.body.membershipType).toBe("silver");
      expect(res.body.premiumSince).toBeDefined();
      expect(res.body.premiumExpiry).toBeDefined();
    });

    test("should expire premium membership automatically", async () => {
      // Make user premium with expired membership
      user.isPremium = true;
      user.membershipType = "silver";
      user.premiumSince = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
      user.premiumExpiry = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // Expired
      await user.save();

      const premiumToken = user.generateAccessToken();

      const res = await request(app)
        .get("/api/premium/verify")
        .set("Cookie", `accessToken=${premiumToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isPremium).toBe(false);
      expect(res.body.membershipType).toBeNull();

      // Verify database was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isPremium).toBe(false);
      expect(updatedUser.membershipType).toBeNull();
    });
  });

  describe("POST /api/payment/webhook", () => {
    let webhookPayload;

    beforeEach(async () => {
      // Create a payment for webhook testing
      await Payment.create({
        userId: user._id,
        orderId: orderId,
        status: "created",
        amount: membershipAmount.silver * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: "silver",
          userId: user._id.toString()
        }
      });

      webhookPayload = {
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: orderId,
              status: "paid"
            }
          }
        }
      };

      // Reset webhook mock before each test in this describe block
      razorpayUtils.validateWebhookSignature.mockReset();
      razorpayUtils.validateWebhookSignature.mockReturnValue(true);
    });

    test("should reject invalid webhook signature", async () => {
      razorpayUtils.validateWebhookSignature.mockReturnValueOnce(false);

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "invalid_signature")
        .send(webhookPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("WebHook Signature is invalid");
    });

    test("should return 404 when payment not found", async () => {
      const nonExistentOrderId = "order_not_found";
      const invalidPayload = {
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: nonExistentOrderId,
              status: "paid"
            }
          }
        }
      };

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(invalidPayload);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Payment not found");
    });

    test("should return 404 when user not found", async () => {
      // Delete the user
      await User.findByIdAndDelete(user._id);

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(webhookPayload);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    test("should update payment status", async () => {
      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(webhookPayload);

      expect(res.statusCode).toBe(200);

      const updatedPayment = await Payment.findOne({ orderId });
      expect(updatedPayment.status).toBe("paid");
    });

    test("should activate premium user", async () => {
      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(webhookPayload);

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isPremium).toBe(true);
      expect(updatedUser.membershipType).toBe("silver");
      expect(updatedUser.premiumSince).toBeDefined();
      expect(updatedUser.premiumExpiry).toBeDefined();
    });

    test("should set silver expiry correctly", async () => {
      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(webhookPayload);

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      const expiryDate = new Date(updatedUser.premiumExpiry);
      const now = new Date();
      const monthDiff = (expiryDate.getFullYear() - now.getFullYear()) * 12 + 
                       (expiryDate.getMonth() - now.getMonth());
      expect(monthDiff).toBe(3);
    });

    test("should set gold expiry correctly", async () => {
      // Create gold payment
      const goldOrderId = "order_gold_webhook";
      await Payment.create({
        userId: user._id,
        orderId: goldOrderId,
        status: "created",
        amount: membershipAmount.gold * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: "gold",
          userId: user._id.toString()
        }
      });

      const goldPayload = {
        payload: {
          payment: {
            entity: {
              id: `pay_gold_${Date.now()}`,
              order_id: goldOrderId,
              status: "paid"
            }
          }
        }
      };

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("X-Razorpay-Signature", "valid_signature")
        .send(goldPayload);

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      const expiryDate = new Date(updatedUser.premiumExpiry);
      const now = new Date();
      const monthDiff = (expiryDate.getFullYear() - now.getFullYear()) * 12 + 
                       (expiryDate.getMonth() - now.getMonth());
      expect(monthDiff).toBe(6);
    });
  });
});