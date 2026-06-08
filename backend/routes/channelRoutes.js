import express from "express"
import Channel from "../models/Channel.js"
import Video from "../models/Video.js"
import Comment from "../models/Comment.js"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { validateChannel } from "../utils/validators.js"
import {
	normalizeAvatarUrl,
	normalizeChannelBannerUrl,
	normalizeThumbnailUrl,
} from "../utils/helpers.js"

const router = express.Router()

const buildChannelLookup = (id) => ({
    $or: [
        { channelId: id },
		...(id?.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
    ],
})

const normalizeChannelResponse = (channelDoc) => {
	const channel = channelDoc.toObject ? channelDoc.toObject() : { ...channelDoc }

	channel.channelBanner = normalizeChannelBannerUrl(
		channel.channelBanner,
		channel.channelName,
	)

	if (channel.owner) {
		channel.owner.avatar = normalizeAvatarUrl(
			channel.owner.avatar,
			channel.owner.username,
		)
	}

	if (Array.isArray(channel.videos)) {
		channel.videos = channel.videos.map((video) => {
			const normalizedVideo = video.toObject ? video.toObject() : { ...video }
			normalizedVideo.thumbnailUrl = normalizeThumbnailUrl(
				normalizedVideo.thumbnailUrl,
				normalizedVideo.videoUrl,
			)

			if (normalizedVideo.uploader) {
				normalizedVideo.uploader.avatar = normalizeAvatarUrl(
					normalizedVideo.uploader.avatar,
					normalizedVideo.uploader.username,
				)
			}

			if (normalizedVideo.channelId) {
				normalizedVideo.channelId.channelBanner = normalizeChannelBannerUrl(
					normalizedVideo.channelId.channelBanner,
					normalizedVideo.channelId.channelName,
				)
			}

			return normalizedVideo
		})
	}

	return channel
}

/**
 * GET /api/channels
 * Returns all channels
 */
router.get("/", async (req, res) => {
	try {
		const channels = await Channel.find()
			.populate("owner", "username avatar userId")
			.sort({ createdAt: -1 })

		res.status(200).json({
			success: true,
			message: "Channels retrieved successfully.",
			channels: channels.map(normalizeChannelResponse),
		})
	} catch (error) {
		console.error("Get channels error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to retrieve channels.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * GET /api/channels/:id
 * Returns channel info with populated videos
 */
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params
		const channel = await Channel.findOne(buildChannelLookup(id))
			.populate("owner", "username avatar userId email")
			.populate({
				path: "videos",
				options: { sort: { uploadDate: -1 } },
				populate: [
					{ path: "uploader", select: "username avatar userId" },
					{ path: "channelId", select: "channelName channelBanner channelId" },
				],
			})

		if (!channel) {
			return res.status(404).json({
				success: false,
				message: "Channel not found.",
			})
		}

		res.status(200).json({
			success: true,
			message: "Channel retrieved successfully.",
			channel: normalizeChannelResponse(channel),
		})
	} catch (error) {
		console.error("Get channel error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to retrieve channel.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * POST /api/channels
 * Creates a channel and links it to the authenticated user
 */
router.post("/", authMiddleware, async (req, res) => {
	try {
		const { channelName, description, channelBanner } = req.body
		const userId = req.user.userId

		const validation = validateChannel({
			channelName,
			description,
			channelBanner,
		})

		if (!validation.isValid) {
			return res.status(400).json({
				success: false,
				message: "Validation failed. Please check the errors below.",
				errors: validation.errors,
			})
		}

		const owner = await User.findById(userId)

		if (!owner) {
			return res.status(404).json({
				success: false,
				message: "User not found.",
			})
		}

		const newChannel = new Channel({
			channelId: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			channelName: channelName.trim(),
			owner: owner._id,
			description: description?.trim() || "",
			...(channelBanner?.trim() ? { channelBanner: channelBanner.trim() } : {}),
		})

		await newChannel.save()

		owner.channels.push(newChannel._id)
		await owner.save()

		await newChannel.populate("owner", "username avatar userId email")

		res.status(201).json({
			success: true,
			message: "Channel created successfully.",
			channel: normalizeChannelResponse(newChannel),
		})
	} catch (error) {
		console.error("Create channel error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to create channel.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * PUT /api/channels/:id
 * Updates a channel (owner only)
 */
router.put("/:id", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const { channelName, description, channelBanner } = req.body
		const userId = req.user.userId

		const channel = await Channel.findOne(buildChannelLookup(id))

		if (!channel) {
			return res.status(404).json({
				success: false,
				message: "Channel not found.",
			})
		}

		if (channel.owner.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only update channels you own.",
			})
		}

		const updates = {
			channelName: channelName ?? channel.channelName,
			description: description ?? channel.description,
			channelBanner: channelBanner ?? channel.channelBanner,
		}

		const validation = validateChannel(updates)

		if (!validation.isValid) {
			return res.status(400).json({
				success: false,
				message: "Validation failed. Please check the errors below.",
				errors: validation.errors,
			})
		}

		channel.channelName = updates.channelName.trim()
		channel.description = updates.description?.trim() || ""
		channel.channelBanner =
			updates.channelBanner?.trim() || channel.channelBanner

		await channel.save()
		await channel.populate("owner", "username avatar userId email")

		res.status(200).json({
			success: true,
			message: "Channel updated successfully.",
			channel: normalizeChannelResponse(channel),
		})
	} catch (error) {
		console.error("Update channel error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to update channel.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * DELETE /api/channels/:id
 * Deletes a channel and its associated videos (owner only)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		const channel = await Channel.findOne(buildChannelLookup(id))

		if (!channel) {
			return res.status(404).json({
				success: false,
				message: "Channel not found.",
			})
		}

		if (channel.owner.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only delete channels you own.",
			})
		}

		const channelVideoIds = [...channel.videos]

		if (channelVideoIds.length > 0) {
			await Comment.deleteMany({ videoId: { $in: channelVideoIds } })
			await Video.deleteMany({ _id: { $in: channelVideoIds } })
		}

		await User.findByIdAndUpdate(channel.owner, {
			$pull: { channels: channel._id },
		})
		await Channel.findByIdAndDelete(channel._id)

		res.status(200).json({
			success: true,
			message: "Channel and associated videos deleted successfully.",
			deletedVideos: channelVideoIds.length,
		})
	} catch (error) {
		console.error("Delete channel error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to delete channel.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

export default router