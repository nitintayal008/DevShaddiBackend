import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if(!token){
      return res.status(401).send("Please Login")
        throw new Error("Token is not valid")
    }

    const decodedObj = await jwt.verify(token, "nitinsecret");
    console.log("decodedObj is", decodedObj);
    const { _id } = decodedObj;
    
    const user = await User.findById(_id);
    console.log("useruser", user);
    req.user = user;
    if (!user) {
      throw new Error("User not found");
    }
    next();
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
};
