import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status:{
        type: String,
        required:true,
        enum:{
           values:["ignored", "interested", "accepted", "rejected"],
           message: `{VALUE} is incorrect status type`
        }
    }
}, {
    timestamps: true
});

connectionRequestSchema.pre("save", function(next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("You can't send request to youself");
    }
    next();
})

const connectionRequestModel = mongoose.model("Connection", connectionRequestSchema);
export default connectionRequestModel;
