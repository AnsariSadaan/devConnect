import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

export const verifyJwt = AsyncHandler(async (req, res, next) => {

  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Unauthorized!!!!T!!!!");
  }

  const user = await User.findById(decoded._id)
  .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user = user;

  next();
});