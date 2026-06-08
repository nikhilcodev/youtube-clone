import mongoose from "mongoose"

const videoSchema = new mongoose.Schema(
    {
        videoId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        title: {
			type: String,
			required: true,
			maxlength: 200,
			minlength: 3,
		},
		thumbnailUrl: {
			type: String,
			required: true,
		},
		videoUrl: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			maxlength: 5000,
			default: "",
		},
		channelId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Channel",
			required: true,
			index: true,
		},
		uploader: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		views: {
			type: Number,
			default: 0,
			min: 0,
		},
		likes: {
			type: Number,
			default: 0,
			min: 0,
		},
		dislikes: {
			type: Number,
			default: 0,
			min: 0,
		},
		// Track which users have liked/disliked for toggle functionality
		likedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		dislikedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		category: {
			type: String,
			enum: [
				"Music",
				"Gaming",
				"Education",
				"Entertainment",
				"Sports",
				"Tech",
				"Other",
			],
			default: "Other",
			index: true,
		},
		uploadDate: {
			type: Date,
			default: Date.now,
			index: true,
		},
		comments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Comment",
			},
		],
    },
    { timestamps: true },
)

export default mongoose.model("Video", videoSchema)
