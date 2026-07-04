import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { validateSignUpData } from '../utils/Validation.js';
import { accessCookieOptions, refreshCookieOptions } from '../utils/cookiesOptions.js';
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

const Signup = AsyncHandler(async (req, res) => {

  // validation of data
  validateSignUpData(req);

  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "password",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl",
    "experience",
    "githubUrl",
    "linkedinUrl",
    "portfolioUrl",
    "location",
    "currentCompany",
  ];

  const userData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      userData[field] = req.body[field];
    }
  });

  //create new user 
  const user = new User(userData)
  const savedUser = await user.save();
  if (!savedUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  const accessToken = savedUser.generateAccessToken();
  const refreshToken = savedUser.generateRefreshToken();

  // Hash refresh token before storing
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  savedUser.refreshToken = hashedRefreshToken;
  await savedUser.save({ validateBeforeSave: false });

  res
  .cookie("accessToken", accessToken, accessCookieOptions)
  .cookie("refreshToken", refreshToken, refreshCookieOptions);

  const userResponse = savedUser.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return res.status(201).json(
    new ApiResponse(201, userResponse, "User registered successfully!")
  );
})

const Login = AsyncHandler(async (req, res) => {
    
  const { emailId, password } = req.body;
  if (!emailId || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ emailId }).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid Credentials!");
  }

  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials!");
  }


  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Hash refresh token before storing
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", accessToken, accessCookieOptions)
  .cookie("refreshToken", refreshToken, refreshCookieOptions);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  return res.status(200).json(
    new ApiResponse(200, userResponse, "Login Successfully")
  );
});

const Logout = AsyncHandler(async (req, res) => {

  // req.user is set by verifyJwt middleware
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      { refreshToken: null }
    );
  }

  res.clearCookie("accessToken", accessCookieOptions)
  .clearCookie("refreshToken", refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, null, "Logout Successfully")
  );
});

const refreshAccessToken = AsyncHandler(async (req, res) => {

  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh Token Missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  // Select refreshToken
  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  // Compare with hashed refresh token
  const isValidRefreshToken = await bcrypt.compare(
    refreshToken,
    user.refreshToken
  );

  if (!isValidRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  // Hash new refresh token before saving
  const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie("accessToken", newAccessToken, accessCookieOptions);
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, null, "Access Token Refreshed")
  );
});

export { Signup, Login, Logout, refreshAccessToken }