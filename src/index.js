import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.js"
import profileRouter from "./routes/profile.js"
import requestsRouter from "./routes/requests.js"
import userRouter from "./routes/user.js";


dotenv.config();

const app = express();

connectDB();

const PORT = 3000;
app.get("/", (req, res) => {
  res.send("Hello World");
});


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter)

app.get("/api/v1", (req, res) => {
  res.send("Hello from API");
});


// Find user by email
app.get("/user", async (req, res) => {
  const email = req.body.emailId;

  const user = await User.findOne({ emailId: email });
  if (!user) {
    return res.status(404).json({
      message: "User not fround",
    });
  }
  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
});

//Fedd Api - get all  the users fromthe database
app.get("/feed", async (req, res) => {
  const user = await User.find({});
  res.status(200).json({
    message: "All users fetched successfully",
    user,
  });
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  res.status(200).json({
    message: "User deleted successfully",
    user,
  });
});

app.patch("/user/:userID", async (req, res) => {
  const userId = req.params?.userID;
  const data = req.body;

  const AllowedUpdates = ["lastName", "firstName", "password", "age"];
  const isAllowed = Object.keys(req.body).every((update) =>
    AllowedUpdates.includes(update)
  );
  if (!isAllowed) {
    return res.status(400).json({
      message: "Updates are not allowed",
    });
  }

  const UpdatedUserData = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  if (!UpdatedUserData) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  try {
    res.status(200).json({
      message: "User updated successfully",
      UpdatedUserData,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
});
