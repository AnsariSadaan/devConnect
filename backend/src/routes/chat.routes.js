import { Router } from "express";
import { chatController, getLastMessagesForConnections, getUnreadCounts } from "../controllers/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/chat/:chatId').get(verifyJwt, chatController);
router.route('/chat/last-messages/all').get(verifyJwt, getLastMessagesForConnections);
router.route('/chat/unread-counts').get(verifyJwt, getUnreadCounts);
export default router;