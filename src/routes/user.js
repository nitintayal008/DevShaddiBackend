import express from "express";
import { userAuth } from "../middlewares/auth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js"
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl about skills";


userRouter.get("/user/requests/recieved", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "about", "skills"]);

        res.status(200).send({message: "Done fetching requests", connectionRequest})
    }catch(err){
        res.status(400).send("Error:" +  err.message);
    }
})


userRouter.get("/user/connections", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or:[
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"}
            ],
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequest.map((row)=>{
            if(row.fromUserId._id.toString()=== loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId
        });
        res.status(200).send({data});
    }catch(error){
        res.status(400).send({
            message: error.message
        })
    }
})


userRouter.get("/user/feed", userAuth, async (req, res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        var limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50: limit;
        const skip = (page-1)*limit;

        const loggedInUser = req.user;

        const connectionRequest  = await ConnectionRequest.find({
            $or:[
                {toUserId: loggedInUser._id },
                {fromUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId")

        const hideUserFromFeed = new Set();

        console.log("connectionRequest", connectionRequest);
        connectionRequest.forEach((req)=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        console.log("hideUserFromFeed",hideUserFromFeed);

        const users = await User.find({
            $and:[
                {_id: {$nin: Array.from(hideUserFromFeed)}},
                {_id: {$ne: loggedInUser._id}}
            ],
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        console.log("users nitin", users);

        res.status(200).send(users);
    }catch(error){
        res.status(400).send("Error:" + error.message);
    }
})

export default userRouter;
