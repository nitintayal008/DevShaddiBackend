import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum:{
        values:["male", "female", "other"],
        message:`{VALUE} is not valid gender`
      }
    //   validate(value) {
    //     if (!["male", "female", "others"].includes(value)) {
    //       throw new Error("Gender data is not valid");
    //     }
    //   },
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_fnlOVj2vxNb0kkf6GBcg3VOYjrOBxU2mbg&s",
      // validate(value){
      //     if(!validator.isUrl(value)){
      //         throw new Error("Invalid URL");
      //     }
      // }
    },
    about: {
      type: String,
      default: "Hey this is default about.",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({firstName: 1, lastName: 1});

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "nitinsecret", {
    expiresIn: "7d",
  });
  return token;
};

// 🔒 Validate Password
userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const isValidPassword = await bcrypt.compare(password, user.password);
  return isValidPassword;
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
