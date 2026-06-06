import axiosInstance from "./axiosInstance";

export const PAGE_SIZE = 12
// The home feed currently pulls a larger first batch and paginates locally
// because the backend page skip logic is not fully reliable yet.
const FETCH_LIMIT = 200
export const FALLBACK_THUMBNAIL = 
    "https://via.placeholder.com/320x180?text=Video"
export const FALLBACK_AVATAR =
	"https://via.placeholder.com/150?text=Avatar"

export const normalizeVideo = (video) => ({
	// Keep both ids because some routes/components still reference the backend
	// Mongo id while others expect the external-style videoId.
	id: video._id || video.videoId,
	videoId: video.videoId || video._id,
	routeId: video._id || video.videoId,
	title: video.title,
	channel:
		video.channelId?.channelName ||
		video.uploader?.username ||
		"Unknown Channel",
	channelId: video.channelId?._id || "",
	thumbnail: video.thumbnailUrl || FALLBACK_THUMBNAIL,
	views: video.views || 0,
	category: video.category || "Other",
	avatar: video.uploader?.avatar || FALLBACK_AVATAR,
	likedBy: Array.isArray(video.likedBy) ? video.likedBy : [],
	dislikedBy: Array.isArray(video.dislikedBy) ? video.dislikedBy : [],
	likes: video.likes || 0,
	dislikes: video.dislikes || 0,
	publishedAt: video.uploadDate || video.createdAt,
	videoUrl: video.videoUrl,
	description: video.description || "",
	comments: Array.isArray(video.comments) ? video.comments : [],
})

export const fetchVideos = () =>
	// The shared instance injects the base URL and auth token automatically.
	axiosInstance.get("/videos", {
		params: {
			page: 1,
			limit: FETCH_LIMIT,
		},
	})

