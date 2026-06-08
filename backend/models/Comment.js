import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        commentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        videoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

export default mongoose.model("Comment", commentSchema)