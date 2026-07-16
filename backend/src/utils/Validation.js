import validator from 'validator';
import { ApiError } from './ApiError.js';  // Adjust path if needed

const validateSignUpData = (req) => {
  
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new ApiError(400, "Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new ApiError(400, "Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new ApiError(400, "Please enter a strong password!");
  }
};


const validateEditProfileData = (req) =>{
  
  const allowedEditField = [
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

  const isEditAllowed = Object.keys(req.body).every((field)=> allowedEditField.includes(field));
  return isEditAllowed;
}

export { validateSignUpData, validateEditProfileData };
