import {Router} from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { reviewRequest, sendRequest } from '../controllers/request.controller.js';
const router = Router();

router.route('/request/send/:status/:toUserId').post(verifyJwt, sendRequest);
router.route('/request/review/:status/:requestId').post(verifyJwt, reviewRequest);

export default router;