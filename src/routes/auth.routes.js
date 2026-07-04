import { Router } from "express";
import { Login, Logout, Signup, refreshAccessToken } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
  authLimiter, 
  sensitiveLimiter,
  generalLimiter 
} from "../utils/rateLimiter.js";

const router = Router();


router.route('/signup').post(authLimiter, Signup);
router.route('/login').post(authLimiter, Login);
router.route("/refresh-token").post(authLimiter, refreshAccessToken);
router.route('/logout').post(authLimiter, verifyJwt, Logout);


export default router;