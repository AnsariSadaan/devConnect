import { Router } from "express";
import { editProfile, Profile } from "../controllers/profile.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/profile/view").get(verifyJwt, Profile);
router.route("/profile/edit").patch(verifyJwt, editProfile);

export default router