import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import { normalizeVideo } from "../api/videos"

const VIDEO_REQUEST_DEDUP_MS = 2000
const videoRequestCache = new Map()

const normalizeComments = (comments = []) =>
    comments.map((comment) => ({
        id: comment._id,
        text: comment.text,
        timestamp: comment.timestamp || comment.createdAt,
        user: {
            _id: comment.userId?._id || "",
            username: comment.userId?.username || "anonymous",
            avatar: comment.userId?.avatar || "",
        },
    })) 

const getEmbedUrl = (videoUrl) => {
	if (!videoUrl) return ""

	const embedParams = new URLSearchParams({
		autoplay: "0",
		controls: "1",
		modestbranding: "1",
		rel: "0",
		playsinline: "1",
		iv_load_policy: "3",
	})

	try {
		const url = new URL(videoUrl)
		const directVideoId = url.searchParams.get("v")
		if (directVideoId) {
			return `https://www.youtube.com/embed/${directVideoId}?${embedParams.toString()}`
		}

		if (url.hostname.includes("youtu.be")) {
			const shortId = url.pathname.replace("/", "")
			return shortId
				? `https://www.youtube.com/embed/${shortId}?${embedParams.toString()}`
				: ""
		}

		return videoUrl
	} catch {
		return videoUrl
	}
}

const getVideoRequest = (id) => {
	const now = Date.now()
	const cachedEntry = videoRequestCache.get(id)

	if (cachedEntry && now - cachedEntry.createdAt < VIDEO_REQUEST_DEDUP_MS) {
		return cachedEntry.promise
	}

	const request = axiosInstance.get(`/videos/${id}`)
	videoRequestCache.set(id, {
		promise: request,
		createdAt: now,
	})

	request.finally(() => {
		window.setTimeout(() => {
			const latestEntry = videoRequestCache.get(id)
			if (latestEntry?.promise === request) {
				videoRequestCache.delete(id)
			}
		}, VIDEO_REQUEST_DEDUP_MS)
	})

	return request
}

export default function useVideoPlayer({ id, user, isAuthenticated }) {
	const navigate = useNavigate()
	const [video, setVideo] = useState(null)
	const [comments, setComments] = useState([])
	const [recommendedVideos, setRecommendedVideos] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [actionLoading, setActionLoading] = useState("")
	const [commentError, setCommentError] = useState("")
	const [commentBusyId, setCommentBusyId] = useState("")

	useEffect(() => {
		setLoading(true)
		setError("")

		getVideoRequest(id)
			.then(({ data }) => {
				setVideo(normalizeVideo(data?.video || {}))
			})
			.catch((fetchError) => {
				console.error("Failed to load video", fetchError)
				setError(
					fetchError.response?.data?.message ||
						"Could not load this video right now.",
				)
			})
			.finally(() => {
				setLoading(false)
			})
	}, [id])

	useEffect(() => {
		setCommentError("")

		axiosInstance
			.get(`/comments/${id}`)
			.then(({ data }) => {
				setComments(normalizeComments(data?.comments || []))
			})
			.catch((fetchError) => {
				console.error("Failed to load comments", fetchError)
				setCommentError(
					fetchError.response?.data?.message ||
						"Could not load comments right now.",
				)
			})
	}, [id])

	useEffect(() => {
		axiosInstance
			.get("/videos", {
				params: {
					page: 1,
					limit: 20,
				},
			})
			.then(({ data }) => {
				const videos = Array.isArray(data?.videos)
					? data.videos.map(normalizeVideo)
					: []
				setRecommendedVideos(
					videos.filter((item) => item.id !== id).slice(0, 12),
				)
			})
			.catch((fetchError) => {
				console.error("Failed to load recommendations", fetchError)
				setRecommendedVideos([])
			})
	}, [id])

	const liked = useMemo(() => {
		if (!user?.id || !video) return false
		return video.likedBy?.includes(user.id)
	}, [user?.id, video])

	const disliked = useMemo(() => {
		if (!user?.id || !video) return false
		return video.dislikedBy?.includes(user.id)
	}, [user?.id, video])

	const handleReaction = useCallback(
		async (type) => {
			if (!isAuthenticated) {
				navigate("/login")
				return
			}

			setActionLoading(type)

			try {
				const { data } = await axiosInstance.put(`/videos/${id}/${type}`)

				setVideo((previousVideo) => ({
					...previousVideo,
					likes: data?.video?.likes ?? previousVideo.likes,
					dislikes: data?.video?.dislikes ?? previousVideo.dislikes,
					likedBy: Array.isArray(data?.video?.likedBy)
						? data.video.likedBy
						: previousVideo.likedBy,
					dislikedBy: Array.isArray(data?.video?.dislikedBy)
						? data.video.dislikedBy
						: previousVideo.dislikedBy,
				}))
			} catch (reactionError) {
				console.error(`Failed to ${type} video`, reactionError)
			} finally {
				setActionLoading("")
			}
		},
		[id, isAuthenticated, navigate],
	)

	const handleAddComment = useCallback(
		async (text) => {
			if (!isAuthenticated) {
				navigate("/login")
				return
			}

			setCommentBusyId("new")
			setCommentError("")

			try {
				const { data } = await axiosInstance.post(`/comments/${id}`, { text })
				const newComment = normalizeComments([data?.comment]).at(0)

				if (newComment) {
					setComments((previousComments) => [
						newComment,
						...previousComments,
					])
				}
			} catch (commentAddError) {
				console.error("Failed to add comment", commentAddError)
				setCommentError(
					commentAddError.response?.data?.message ||
						"Could not add comment right now.",
				)
			} finally {
				setCommentBusyId("")
			}
		},
		[id, isAuthenticated, navigate],
	)

	const handleEditComment = useCallback(async (commentToEdit, text) => {
		setCommentBusyId(commentToEdit.id)
		setCommentError("")

		try {
			const { data } = await axiosInstance.put(`/comments/${commentToEdit.id}`, {
				text,
			})
			const updatedComment = normalizeComments([data?.comment]).at(0)

			if (updatedComment) {
				setComments((previousComments) =>
					previousComments.map((comment) =>
						comment.id === commentToEdit.id ? updatedComment : comment,
					),
				)
			}
		} catch (commentEditError) {
			console.error("Failed to edit comment", commentEditError)
			setCommentError(
				commentEditError.response?.data?.message ||
					"Could not update comment right now.",
			)
		} finally {
			setCommentBusyId("")
		}
	}, [])

	const handleDeleteComment = useCallback(async (commentToDelete) => {
		const confirmed = window.confirm(
			"Delete this comment? This action cannot be undone.",
		)
		if (!confirmed) return

		setCommentBusyId(commentToDelete.id)
		setCommentError("")

		try {
			await axiosInstance.delete(`/comments/${commentToDelete.id}`)
			setComments((previousComments) =>
				previousComments.filter((comment) => comment.id !== commentToDelete.id),
			)
		} catch (commentDeleteError) {
			console.error("Failed to delete comment", commentDeleteError)
			setCommentError(
				commentDeleteError.response?.data?.message ||
					"Could not delete comment right now.",
			)
		} finally {
			setCommentBusyId("")
		}
	}, [])

	return {
		video,
		embedUrl: getEmbedUrl(video?.videoUrl),
		comments,
		recommendedVideos,
		loading,
		error,
		actionLoading,
		commentError,
		commentBusyId,
		liked,
		disliked,
		handleReaction,
		handleAddComment,
		handleEditComment,
		handleDeleteComment,
	}
}
