import express from "express"
import Video from "../models/Video.js"
import Channel from "../models/Channel.js"

import authMiddleware from "../middleware/authMiddleware.js"
import { validateVideo } from "../utils/validators.js"

import {
	getThumbnailUrl,
	normalizeAvatarUrl,
	normalizeChannelBannerUrl,
	normalizeThumbnailUrl,
} from "../utils/helpers.js"

const router = express.Router()

const normalizeVideoResponse = (videoDoc) => {
	const video = videoDoc.toObject ? videoDoc.toObject() : { ...videoDoc }

	video.thumbnailUrl = normalizeThumbnailUrl(video.thumbnailUrl, video.videoUrl)

	if (video.uploader) {
		video.uploader.avatar = normalizeAvatarUrl(
			video.uploader.avatar,
			video.uploader.username,
		)
	}

	if (video.channelId) {
		video.channelId.channelBanner = normalizeChannelBannerUrl(
			video.channelId.channelBanner,
			video.channelId.channelName,
		)
	}

	if (Array.isArray(video.comments)) {
		video.comments = video.comments.map((comment) => {
			const normalizedComment = comment.toObject
				? comment.toObject()
				: { ...comment }

			if (normalizedComment.userId) {
				normalizedComment.userId.avatar = normalizeAvatarUrl(
					normalizedComment.userId.avatar,
					normalizedComment.userId.username,
				)
			}

			return normalizedComment
		})
	}

	return video
}

/**
 * GET /api/videos
 * Returns all videos with optional filtering
 *
 * Query Parameters:
 * - search: Filter by video title (case-insensitive)
 * - category: Filter by category
 * - page: Pagination page (default: 1)
 * - limit: Items per page (default: 10)
 *
 * Returns: { success, message, videos, pagination }
 */
router.get("/", async (req, res) => {
	try {
		const { search, category, page = 1, limit = 10 } = req.query

		// Build filter object
		const filter = {}

		// Search filter (case-insensitive)
		if (search) {
			filter.title = { $regex: search, $options: "i" }
		}

		// Category filter
		if (category) {
			filter.category = category
		}

		// Calculate pagination
		const skip = (page - 1) * limit

		// Fetch videos
		const videos = await Video.find(filter)
			.populate("uploader", "username avatar userId")
			.populate("channelId", "channelName channelBanner owner")
			//.skip(skip)
			.limit(parseInt(limit))
			.sort({ uploadDate: -1 })

		// Get total count for pagination
		const total = await Video.countDocuments(filter)

		res.status(200).json({
			success: true,
			message: "Videos retrieved successfully.",
			videos: videos.map(normalizeVideoResponse),
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		console.error("Get videos error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to retrieve videos.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * GET /api/videos/:id
 * Returns a single video by ID and increments view count
 *
 * Path Parameters:
 * - id: Video MongoDB ID
 *
 * Returns: { success, message, video }
 */
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params

		// Validate MongoDB ID format
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				success: false,
				message: "Invalid video ID format.",
			})
		}

		// Find video and increment views
		const video = await Video.findByIdAndUpdate(
			id,
			{ $inc: { views: 1 } },
			{ returnDocument: "after" },
		)
			.populate("uploader", "username avatar userId email")
			.populate("channelId", "channelName channelBanner subscribers owner")
			.populate({
				path: "comments",
				populate: {
					path: "userId",
					select: "username avatar",
				},
			})

		if (!video) {
			return res.status(404).json({
				success: false,
				message: "Video not found.",
			})
		}

		res.status(200).json({
			success: true,
			message: "Video retrieved successfully.",
			video: normalizeVideoResponse(video),
		})
	} catch (error) {
		console.error("Get video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to retrieve video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * POST /api/videos
 * Creates a new video (protected route)
 * Creator becomes the uploader and must own the channel
 *
 * Headers: Authorization: Bearer <token>
 * Body: { title, description, videoUrl, thumbnailUrl, channelId, category }
 *
 * Returns: { success, message, video }
 * Errors: 400 (validation), 401 (unauthorized), 403 (not channel owner), 500 (server)
 */

router.post("/", authMiddleware, async (req, res) => {
	try {
		const { title, description, videoUrl, channelId, category } = req.body
		const userId = req.user.userId
		const normalizedChannelId = channelId?.trim()

		// ==================== VALIDATE VIDEO URL ====================
		if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim() === "") {
			return res.status(400).json({
				success: false,
				message: "Video URL is required and must be a valid string.",
				errors: { videoUrl: "Must provide a valid YouTube URL" },
			})
		}

		// ==================== THUMBNAIL GENERATION ====================
		const generatedThumbnail = getThumbnailUrl(videoUrl.trim())

		if (!generatedThumbnail) {
			return res.status(400).json({
				success: false,
				message: "Invalid YouTube URL. Could not extract thumbnail.",
				errors: { videoUrl: "Please provide a valid YouTube URL" },
			})
		}

		// ==================== VALIDATION ====================
		const validation = validateVideo({
			title,
			description,
			videoUrl,
			thumbnailUrl: generatedThumbnail,
			channelId: normalizedChannelId,
			category,
		})

		if (!validation.isValid) {
			return res.status(400).json({
				success: false,
				message: "Validation failed. Please check the errors below.",
				errors: validation.errors,
			})
		}

		// ==================== CHANNEL OWNERSHIP CHECK ====================
		const channel = await Channel.findOne({
			$or: [
				{ channelId: normalizedChannelId },
				...(normalizedChannelId?.match(/^[0-9a-fA-F]{24}$/)
					? [{ _id: normalizedChannelId }]
					: []),
			],
		})

		if (!channel) {
			return res.status(404).json({
				success: false,
				message: "Channel not found.",
			})
		}

		// Check if user owns the channel
		if (channel.owner.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only upload videos to channels you own.",
			})
		}

		// ==================== VIDEO CREATION ====================
		const videoId = `vid_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`

		const newVideo = new Video({
			videoId,
			title: title.trim(),
			description: description?.trim() || "",
			videoUrl,
			thumbnailUrl: generatedThumbnail,
			channelId: channel._id,
			uploader: userId,
			category,
		})

		await newVideo.save()

		// ==================== ADD TO CHANNEL ====================
		channel.videos.push(newVideo._id)
		await channel.save()

		// ==================== POPULATE AND RESPONSE ====================
		await newVideo.populate("uploader", "username avatar userId")
		await newVideo.populate("channelId", "channelName channelBanner")

		res.status(201).json({
			success: true,
			message: "Video created successfully.",
			video: normalizeVideoResponse(newVideo),
		})
	} catch (error) {
		console.error("Create video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to create video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * PUT /api/videos/:id
 * Updates a video (protected route, owner only)
 * Only the uploader can update their video
 *
 * Headers: Authorization: Bearer <token>
 * Path Parameters: id (video MongoDB ID)
 * Body: { title, description, category, thumbnailUrl }
 *
 * Returns: { success, message, video }
 * Errors: 400 (validation), 401 (unauthorized), 403 (not owner), 404 (not found), 500
 */
router.put("/:id", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const { title, description, category, thumbnailUrl } = req.body
		const userId = req.user.userId

		// Validate MongoDB ID format
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				success: false,
				message: "Invalid video ID format.",
			})
		}

        // ==================== FIND VIDEO ====================
		const video = await Video.findById(id)

		if (!video) {
			return res.status(404).json({
				success: false,
				message: "Video not found.",
			})
		}

		// ==================== OWNERSHIP CHECK ====================
		if (video.uploader.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only update your own videos.",
			})
		}

		// ==================== VALIDATION ====================
		const updates = {}
		if (title) {
			if (title.trim().length < 3) {
				return res.status(400).json({
					success: false,
					message: "Video title must be at least 3 characters long.",
				})
			}
			updates.title = title.trim()
		}

		if (description !== undefined) {
			updates.description = description.trim()
		}

		if (category) {
			const validCategories = [
				"Music",
				"Gaming",
				"Education",
				"Entertainment",
				"Sports",
				"Tech",
				"Other",
			]
			if (!validCategories.includes(category)) {
				return res.status(400).json({
					success: false,
					message: `Category must be one of: ${validCategories.join(", ")}`,
				})
			}
			updates.category = category
		}

		if (thumbnailUrl) {
			updates.thumbnailUrl = thumbnailUrl
		}

		// ==================== UPDATE VIDEO ====================
		const updatedVideo = await Video.findByIdAndUpdate(id, updates, {
			returnDocument: "after",
		})
			.populate("uploader", "username avatar userId")
			.populate("channelId", "channelName channelBanner")

		res.status(200).json({
			success: true,
			message: "Video updated successfully.",
			video: normalizeVideoResponse(updatedVideo),
		})
	} catch (error) {
		console.error("Update video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to update video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * DELETE /api/videos/:id
 * Deletes a video (protected route, owner only)
 * Removes video from channel's videos array
 *
 * Headers: Authorization: Bearer <token>
 * Path Parameters: id (video MongoDB ID)
 *
 * Returns: { success, message }
 * Errors: 401 (unauthorized), 403 (not owner), 404 (not found), 500
 */
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		// Validate MongoDB ID format
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				success: false,
				message: "Invalid video ID format.",
			})
		}

		// ==================== FIND VIDEO ====================
		const video = await Video.findById(id)

		if (!video) {
			return res.status(404).json({
				success: false,
				message: "Video not found.",
			})
		}

		// ==================== OWNERSHIP CHECK ====================
		if (video.uploader.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: "You can only delete your own videos.",
			})
		}

		// ==================== REMOVE FROM CHANNEL ====================
		await Channel.findByIdAndUpdate(video.channelId, { $pull: { videos: id } })

		// ==================== DELETE VIDEO ====================
		await Video.findByIdAndDelete(id)

		res.status(200).json({
			success: true,
			message: "Video deleted successfully.",
		})
	} catch (error) {
		console.error("Delete video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to delete video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * PUT /api/videos/:id/like
 * Toggles like on a video (protected route)
 * If user already liked, unlike it. Otherwise, add like and remove dislike if exists.
 *
 * Headers: Authorization: Bearer <token>
 * Path Parameters: id (video MongoDB ID)
 *
 * Returns: { success, message, video }
 * Errors: 401 (unauthorized), 404 (not found), 500
 */
router.put("/:id/like", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		// Validate MongoDB ID format
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				success: false,
				message: "Invalid video ID format.",
			})
		}

        // ==================== FIND VIDEO ====================
		const video = await Video.findById(id)

		if (!video) {
			return res.status(404).json({
				success: false,
				message: "Video not found.",
			})
		}

		// ==================== CHECK IF USER ALREADY LIKED ====================
		// Check if user is in the likes array
		const userIndex = video.likedBy?.indexOf(userId) ?? -1

		if (userIndex > -1) {
			// User already liked - remove like
			video.likedBy.splice(userIndex, 1)
			video.likes = Math.max(0, video.likes - 1)
		} else {
			// User hasn't liked - add like
			if (!video.likedBy) video.likedBy = []
			video.likedBy.push(userId)
			video.likes += 1

			// Remove dislike if exists
			const dislikeIndex = video.dislikedBy?.indexOf(userId) ?? -1
			if (dislikeIndex > -1) {
				video.dislikedBy.splice(dislikeIndex, 1)
				video.dislikes = Math.max(0, video.dislikes - 1)
			}
		}

		await video.save()

		// ==================== RESPONSE ====================
		res.status(200).json({
			success: true,
			message: userIndex > -1 ? "Like removed." : "Video liked.",
			video,
		})
	} catch (error) {
		console.error("Like video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to like video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * PUT /api/videos/:id/dislike
 * Toggles dislike on a video (protected route)
 * If user already disliked, remove dislike. Otherwise, add dislike and remove like if exists.
 *
 * Headers: Authorization: Bearer <token>
 * Path Parameters: id (video MongoDB ID)
 *
 * Returns: { success, message, video }
 * Errors: 401 (unauthorized), 404 (not found), 500
 */
router.put("/:id/dislike", authMiddleware, async (req, res) => {
	try {
		const { id } = req.params
		const userId = req.user.userId

		// Validate MongoDB ID format
		if (!id.match(/^[0-9a-fA-F]{24}$/)) {
			return res.status(400).json({
				success: false,
				message: "Invalid video ID format.",
			})
		}

		// ==================== FIND VIDEO ====================
		const video = await Video.findById(id)

		if (!video) {
			return res.status(404).json({
				success: false,
				message: "Video not found.",
			})
		}

		// ==================== CHECK IF USER ALREADY DISLIKED ====================
		const userIndex = video.dislikedBy?.indexOf(userId) ?? -1

		if (userIndex > -1) {
			// User already disliked - remove dislike
			video.dislikedBy.splice(userIndex, 1)
			video.dislikes = Math.max(0, video.dislikes - 1)
		} else {
			// User hasn't disliked - add dislike
			if (!video.dislikedBy) video.dislikedBy = []
			video.dislikedBy.push(userId)
			video.dislikes += 1

			// Remove like if exists
			const likeIndex = video.likedBy?.indexOf(userId) ?? -1
			if (likeIndex > -1) {
				video.likedBy.splice(likeIndex, 1)
				video.likes = Math.max(0, video.likes - 1)
			}
		}

		await video.save()

		// ==================== RESPONSE ====================
		res.status(200).json({
			success: true,
			message: userIndex > -1 ? "Dislike removed." : "Video disliked.",
			video,
		})
	} catch (error) {
		console.error("Dislike video error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to dislike video.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

export default router