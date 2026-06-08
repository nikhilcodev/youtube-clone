import mongoose from "mongoose";
import { buildChannelBannerUrl } from "../utils/helpers.js"

const channelSchema = new mongoose.Schema(
    {
		channelId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		channelName: {
			type: String,
			required: true,
			maxlength: 100,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		description: {
			type: String,
			maxlength: 5000,
			default: "",
		},
		channelBanner: {
			type: String,
			default: () => buildChannelBannerUrl("Channel Banner"),
		},
		subscribers: {
			type: Number,
			default: 0,
			min: 0,
		},
		videos: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Video",
			},
		],
	},
    { timestamps: true }
)

export default mongoose.model("Channel", channelSchema)