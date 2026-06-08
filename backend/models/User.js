import mongoose from "mongoose";
import { buildAvatarUrl } from "../utils/helpers.js"

const userSchema = new mongoose.Schema(
    {
		userId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			minlength: 3,
			maxlength: 50,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		avatar: {
			type: String,
			default: () => buildAvatarUrl("Avatar"),
		},
		channels: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Channel",
			},
		],
	},
	{ timestamps: true },
)

export default mongoose.model("User", userSchema)