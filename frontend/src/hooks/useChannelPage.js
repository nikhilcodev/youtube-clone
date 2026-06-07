import { useEffect, useMemo, useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { FALLBACK_AVATAR, normalizeVideo } from "../api/videos"
import usePageTitle from "./usePageTitle"

export const CHANNEL_TABS = [
    "Home",
    "Videos",
    "Shorts",
    "Live",
    "Playlists",
    "Community",
]

export const SORT_OPTIONS = ["Latest", "Popular", "oldest"]

export const FALLBACK_CATEGORIES = [
    "Music",
    "Gaming",
    "Education",
    "Entertainment",
    "Sports",
    "Tech",
    "Other",
]

const EMPTY_VIDEO_FORM = {
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: FALLBACK_CATEGORIES[0],
}

// Normalize backend channel responses so the page can rely on one stable shape.
const normalizeChannel = (channel) => ({
	id: channel?._id || channel?.channelId || "",
	channelId: channel?.channelId || channel?._id || "",
	channelName: channel?.channelName || "Untitled Channel",
	description: channel?.description || "No description provided.",
	channelBanner:
		channel?.channelBanner ||
		"https://via.placeholder.com/1280x320?text=Channel+Banner",
	subscribers: Array.isArray(channel?.subscribers)
		? channel.subscribers.length
		: Number(channel?.subscriberCount ?? channel?.subscribers ?? 0),
	owner: {
		id: channel?.owner?._id || "",
		username:
			channel?.owner?.username || channel?.channelName || "Channel Owner",
		avatar: channel?.owner?.avatar || FALLBACK_AVATAR,
	},
	videos: Array.isArray(channel?.videos)
		? channel.videos.map(normalizeVideo)
		: [],
})

const validateVideoForm = (formData, mode) => {
	const errors = {}

	if (!formData.title.trim()) {
		errors.title = "Title is required."
	} else if (formData.title.trim().length < 3) {
		errors.title = "Title must be at least 3 characters."
	}

	if (!formData.description.trim()) {
		errors.description = "Description is required."
	}

	if (mode === "create" && !formData.videoUrl.trim()) {
		errors.videoUrl = "Video URL is required."
	}

	if (!formData.category.trim()) {
		errors.category = "Category is required."
	}

	return errors
}

export default function useChannelPage({ channelId, user, isAuthenticated }) {
	const [channel, setChannel] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedSort, setSelectedSort] = useState("Latest")
	const [categories] = useState(FALLBACK_CATEGORIES)
	const [modalOpen, setModalOpen] = useState(false)
	const [formMode, setFormMode] = useState("create")
	const [formData, setFormData] = useState(EMPTY_VIDEO_FORM)
	const [formErrors, setFormErrors] = useState({})
	const [submitError, setSubmitError] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [editingVideoId, setEditingVideoId] = useState("")
	const [deletingVideoId, setDeletingVideoId] = useState("")

	useEffect(() => {
		// Reload channel data whenever the route changes to a different channel.
		setLoading(true)
		setError("")

		axiosInstance
			.get(`/channels/${channelId}`)
			.then(({ data }) => {
				setChannel(normalizeChannel(data?.channel || {}))
			})
			.catch((fetchError) => {
				console.error("Failed to load channel", fetchError)
				setError(
					fetchError.response?.data?.message ||
						"Could not load this channel right now.",
				)
			})
			.finally(() => {
				setLoading(false)
			})
	}, [channelId])
	usePageTitle(
		channel?.channelName ? `${channel.channelName} - YouTube` : "YouTube",
	)

	const sortedVideos = useMemo(() => {
		if (!channel?.videos) return []

		const videos = [...channel.videos]

		if (selectedSort === "Popular") {
			return videos.sort((a, b) => (b.views || 0) - (a.views || 0))
		}

		if (selectedSort === "Oldest") {
			return videos.sort(
				(a, b) =>
					new Date(a.publishedAt || 0).getTime() -
					new Date(b.publishedAt || 0).getTime(),
			)
		}

		return videos.sort(
			(a, b) =>
				new Date(b.publishedAt || 0).getTime() -
				new Date(a.publishedAt || 0).getTime(),
		)
	}, [channel?.videos, selectedSort])

	const isOwner =
		Boolean(isAuthenticated && user?.id && channel?.owner?.id) &&
		String(user.id) === String(channel.owner.id)

	// Shared reset keeps create/edit modal state predictable between openings.
	const resetFormState = () => {
		setFormData({
			...EMPTY_VIDEO_FORM,
			category: categories[0] || FALLBACK_CATEGORIES[0],
		})
		setFormErrors({})
		setSubmitError("")
		setEditingVideoId("")
	}

	const openCreateModal = () => {
		setFormMode("create")
		resetFormState()
		setModalOpen(true)
	}

	const openEditModal = (video) => {
		setFormMode("edit")
		setEditingVideoId(video.id)
		setFormErrors({})
		setSubmitError("")
		setFormData({
			title: video.title || "",
			description: video.description || "",
			videoUrl: video.videoUrl || "",
			thumbnailUrl: video.thumbnail || "",
			category: video.category || categories[0] || FALLBACK_CATEGORIES[0],
		})
		setModalOpen(true)
	}

	const closeModal = () => {
		if (submitting) return
		setModalOpen(false)
		resetFormState()
	}

	const updateFormField = (field, value) => {
		setFormData((current) => ({
			...current,
			[field]: value,
		}))
		setFormErrors((current) => {
			if (!current[field]) return current
			return {
				...current,
				[field]: "",
			}
		})
		setSubmitError("")
	}

	const submitVideoForm = async (event) => {
		event.preventDefault()

		const errors = validateVideoForm(formData, formMode)
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors)
			return
		}

		setSubmitting(true)
		setSubmitError("")

		const payload = {
			title: formData.title.trim(),
			description: formData.description.trim(),
			videoUrl: formData.videoUrl.trim(),
			thumbnailUrl: formData.thumbnailUrl.trim(),
			category: formData.category.trim(),
			channelId: channel.channelId || channel.id,
		}

		try {
			if (formMode === "create") {
				const { data } = await axiosInstance.post("/videos", payload)
				const nextVideo = normalizeVideo(data?.video || {})

				// Prepend new uploads locally so the grid updates immediately without another fetch.
				setChannel((current) => ({
					...current,
					videos: [nextVideo, ...(current?.videos || [])],
				}))
			} else {
				const { data } = await axiosInstance.put(`/videos/${editingVideoId}`, {
					title: payload.title,
					description: payload.description,
					category: payload.category,
					thumbnailUrl: payload.thumbnailUrl,
				})
				const nextVideo = normalizeVideo(data?.video || {})

				// Replace the edited video in place so sort/filter state is preserved.
				setChannel((current) => ({
					...current,
					videos: (current?.videos || []).map((video) =>
						video.id === nextVideo.id ? nextVideo : video,
					),
				}))
			}

			setModalOpen(false)
			resetFormState()
		} catch (requestError) {
			const apiErrors = requestError.response?.data?.errors
			if (apiErrors && typeof apiErrors === "object") {
				setFormErrors((current) => ({
					...current,
					...apiErrors,
				}))
			}

			setSubmitError(
				requestError.response?.data?.message ||
					"Could not save the video right now.",
			)
		} finally {
			setSubmitting(false)
		}
	}

	const deleteVideo = async (video) => {
		const confirmed = window.confirm(
			`Delete "${video.title}"? This action cannot be undone.`,
		)
		if (!confirmed) return

		setDeletingVideoId(video.id)

		try {
			await axiosInstance.delete(`/videos/${video.id}`)

			// Remove the deleted video locally so the owner sees the result right away.
			setChannel((current) => ({
				...current,
				videos: (current?.videos || []).filter((item) => item.id !== video.id),
			}))
		} catch (requestError) {
			setSubmitError(
				requestError.response?.data?.message ||
					"Could not delete the video right now.",
			)
		} finally {
			setDeletingVideoId("")
		}
	}

	return {
		channel,
		loading,
		error,
		selectedSort,
		setSelectedSort,
		sortedVideos,
		isOwner,
		categories,
		modalOpen,
		formMode,
		formData,
		formErrors,
		submitError,
		submitting,
		deletingVideoId,
		openCreateModal,
		openEditModal,
		closeModal,
		updateFormField,
		submitVideoForm,
		deleteVideo,
	}
}
