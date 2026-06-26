import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password: " + value);
        }
      }
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not valid gender type`,
      }
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
    },
    
    premiumExpiresAt: Date,

    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error(`Invalid Photo URL: ${value}`);
        }
      }
    },
    about: {
      type: String,
      maxlength: 500,
      default: "This is default about of the user!",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      default: 0,
    },
    
    githubUrl: {
      type: String,
      trim: true,
      default: "",
      validate(value) {
        if(value && !validator.isURL(value)) {
          throw new Error(`Invalid github profile URL: ${value}`);
        }
      }
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error(`Invalid Linkedin profile URL: ${value}`);
        }
      }
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: "",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error(`Invalid portfolio profile URL: ${value}`);
        }
      }
    },

    location: {
      type: String,
      trim: true, 
    },

    currentCompany: {
      type: String,
      trim: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
    
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true 
  }
);

userSchema.pre("save", async function (next) {
  
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJWT = async function () {
  
  const user = this;
  const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.ExpiresIn
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {

  console.log("Input Password:", passwordInputByUser);
  console.log("DB Hash:", this.password);

  const user = this;
  
  const passwordHash =  user.password;
  if (!passwordHash) {
    throw new Error(
      "Password field not selected"
    );
  }
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
}


export const User = mongoose.model('User', userSchema)