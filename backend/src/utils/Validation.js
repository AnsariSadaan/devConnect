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

  const body = req.body;
  const isEditAllowed = Object.keys(req.body).every((field)=> allowedEditField.includes(field));

  if(!isEditAllowed){
    return false;
  }

  if(body.age !== undefined){
    const age = Number(body.age);
    if(isNaN(age) || age < 15 || age > 100){
      return false
    }
  }

  // Validate gender if present
  if (body.gender && !['male', 'female', 'other'].includes(body.gender.toLowerCase())) {
    return false;
  }

  // Validate photoUrl if present
  if (body.photoUrl && !validator.isURL(body.photoUrl)) {
    return false;
  }

  // Validate githubUrl if present
  if (body.githubUrl && !validator.isURL(body.githubUrl)) {
    return false;
  }

  // Validate linkedinUrl if present
  if (body.linkedinUrl && !validator.isURL(body.linkedinUrl)) {
    return false;
  }

  // Validate portfolioUrl if present
  if (body.portfolioUrl && !validator.isURL(body.portfolioUrl)) {
    return false;
  }

  // Validate emailId if present (optional, but if provided should be valid)
  if (body.emailId && !validator.isEmail(body.emailId)) {
    return false;
  }

  // Validate experience if present
  if (body.experience !== undefined) {
    const experience = Number(body.experience);
    if (isNaN(experience) || experience < 0 || experience > 50) {
      return false;
    }
  }


  return true;
}

export { validateSignUpData, validateEditProfileData };
