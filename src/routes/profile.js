import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { validateProfileEditData } from "../utils/validations.js";

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res)=>{
    try{    
        const user = req.user;
    res.send({user: user});
    }catch(error){
        res.status(400).json("Error:" + error.message);
    }
    
});


profileRouter.patch("/profile/edit", userAuth, async (req,res)=>{
    console.log("req.body nitin", req.body)
    try {
        if(!validateProfileEditData(req)){
            throw new Error("Invalid edit requests");
        }

        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key)=>loggedInUser[key] = req.body[key]);
        await loggedInUser.save();
        res.status(200).json({mesage : `${loggedInUser.firstName} your profile is updated successful`, user: loggedInUser})

    } catch (error) {
        res.status(400).send(`${error}User is not correct`);
    }
});

profileRouter.patch("/profile/password",async (req, res)=>{
    try{
        const {newPassword} = req.body;
        const loggedInUser = req.user;
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = newPasswordHash;

        res.status(200).send("Password updated successfully");
    }catch(error){

    }
})

export default profileRouter;
