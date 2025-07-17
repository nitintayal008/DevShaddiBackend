import express from "express";
import bcrypt from "bcrypt";
const authRouter = express.Router();

import User from "../models/user.js";
import { validateSignUpData } from "../utils/validations.js";

authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  const user = await User.findOne({ emailId: emailId });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await user.validatePassword(password);

  if (isPasswordValid) {
    const token = await user.getJWT();
    res.cookie("token", token);
    res.send({ message: "Login Successful!", user });
  } else {
    throw new Error("Password is incorrect");
  }
});

authRouter.post("/signup", async (req, res) => {
  const password = req.body.password;
  validateSignUpData(req);

  const paasswordHash = await bcrypt.hash(password, 10);
  const existingUser = await User.findOne({ emailId: req.body.emailId });
  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailId: req.body.emailId,
    password: paasswordHash,
    age: req.body.age,
  });

  try {
    await user.save();
    res.status(201).json({
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Email already exists",
      });
    } else {
      res.status(400).json({
        message: "Error saving user",
        error: error.message,
      });
    }
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successfully");
});

export default authRouter;
