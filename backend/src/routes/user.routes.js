import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Feed, userConnection, userRequestsReceived } from "../controllers/user.controller.js";
const router = Router();


router.route('/feed').get(verifyJwt, Feed);
router.route('/request/received').get(verifyJwt, userRequestsReceived);
router.route('/connections').get(verifyJwt, userConnection);

export default router;