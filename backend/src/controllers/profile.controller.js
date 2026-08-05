import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { validateEditProfileData } from "../utils/Validation.js";

const Profile = AsyncHandler(async (req, res)=> {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized access - user not found")
    }
    return res.status(200).json(new ApiResponse(200, user, "profile fetched successfully"))
})

const editProfile = AsyncHandler(async (req, res)=>{
    
  // Validate the edit request
  const isValid = validateEditProfileData(req);

  if (!isValid) {
    throw new ApiError(400, "Invalid edit request");
  }
  const loggedInUser = req.user;

  // Only update allowed fields (already validated)
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
    "experience",
    "githubUrl",
    "linkedinUrl",
    "portfolioUrl",
    "location",
    "currentCompany",
  ];

  Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

  try {
    const updatedUser = await loggedInUser.save();
    
    if (!updatedUser) {
      throw new ApiError(500, "Something went wrong while updating profile");
    }

    return res.status(200).json(
      new ApiResponse(200, updatedUser, `${updatedUser.firstName}, your profile was updated successfully`)
    );
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      throw new ApiError(400, errors.join(', '));
    }
    throw error;
  }
})

export {Profile, editProfile}