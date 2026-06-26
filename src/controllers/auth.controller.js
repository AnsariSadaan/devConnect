import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { validateSignUpData } from '../utils/Validation.js';
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

  //encrypt the password
  // const passwordHash = await bcrypt.hash(password, 10);

  //create new user 
  const user = new User(userData)


  const savedUser = await user.save();
  if (!savedUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }
  const token = await savedUser.getJWT();
  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600000)
  });

  const userResponse = savedUser.toObject();
  delete userResponse.password;

  return res.status(201).json(new ApiResponse(201, userResponse, "User Added successfully!"));
})


const Login = AsyncHandler(async (req, res) => {
    
  const { emailId, password } = req.body;
  const user = await User.findOne({ emailId }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid Credentials!");
  }

  const isPasswordValid = await user.validatePassword(password);

  console.log("Password Valid:", isPasswordValid);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials!");
  }

  const token = await user.getJWT();

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 8 * 3600000),
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return res.status(200).json(
    new ApiResponse(200, userResponse, "Login Successfully!")
  );
});


const Logout = AsyncHandler(async (req, res)=> {
  
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  }) 
  return res.status(200).json(new ApiResponse(200, null, "Logout Successfully!"))
})

export { Signup, Login, Logout }