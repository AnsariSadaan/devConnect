import { Router } from "express";
import { paymentController, paymentWithWebhook, premiumVerify, verifyPayment } from "../controllers/payment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/payment/create').post(verifyJwt, paymentController);
router.route('/payment/webhook').post(paymentWithWebhook);
router.route('/premium/verify').get(verifyJwt, premiumVerify);
router.route('/payment/verify').post(verifyJwt, verifyPayment);
export default router;