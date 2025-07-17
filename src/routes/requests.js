import express from "express";
import { userAuth } from "../middlewares/auth.js";
import ConnectionRequest from "../models/connectionRequest.js"
import User from "../models/user.js"
import mongoose from "mongoose";

const requestsRouter = express.Router();

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    console.log("hello i am here");

    try {
      const fromUserId = req.user._id;
      const { status, toUserId } = req.params;

    if(fromUserId === toUserId ){
        return res.status(400).send("You can't send request to yourself")
      }

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status
        });
      }

      const toUser = await User.findById(toUserId);
      console.log("hello user", toUser);
      if (!toUser) {
        return res.status(400).send({ message: "User not found" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }
        ]
      });

      if (existingConnectionRequest) {
        return res.status(400).send({ message: "Connection already exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status
      });

      const data = await connectionRequest.save();

      res.status(200).json({
        message: req.user.firstName + " is" + status + "in" + toUser.firstName,
        data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending request", error: error.message });
    }
  }
);

requestsRouter.post("/request/review/:status/:requestId", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        console.log("user is ", loggedInUser);
        const {status , requestId} = req.params;
        const allowedStatus= ["accepted", "rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).send({message: "Status not Allowed" })
        }


        console.log("nnnnnnnnnnnnnnnn",{
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })

        const toObjectId = (value) =>
          typeof value === "string"
            ? new mongoose.Types.ObjectId(value)
            : value;

        const connectionRequest = await ConnectionRequest.findOne({
          _id: toObjectId(requestId),
          toUserId: toObjectId(loggedInUser._id),
          status: "interested",
        });

        console.log("fw connectionRequest", connectionRequest);

        if(!connectionRequest){
          return res.status(400).send({message:"Connection request not found"})
        }

        connectionRequest.status = status;
        const data =await connectionRequest.save();

        res.json({messaga: "Connection Request " + status, data});

    }catch(error){
         res.status(400).send("Error:" + error.message)
    }
})

requestsRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  const user = req.user;

  res.send(user.firstName + "send a connection request");
});

export default requestsRouter;
