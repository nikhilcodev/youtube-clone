import { useEffect, useCallback, useMemo, useState } from "react";
import { useSearchParams} from "react-router-dom"
import { fetchVideos, normalizeVideo, PAGE_SIZE } from "../api/videos"

const filterVideosByCategory = (videos, category) => {
    if (category === "All") return videos
    return videos.filter((video) => video.category === category)
}

const filterVideosBySearch = (videos, query) => {
	const normalizedQuery = query.trim().toLowerCase()
	if (!normalizedQuery) return videos

	return videos.filter((video) =>
		video.title?.toLowerCase().includes(normalizedQuery),
	)
}

const applyFilters = (videos, category, query) =>
	filterVideosBySearch(filterVideosByCategory(videos, category), query)

// Some backend responses can repeat items, so keep only one entry per normalized id.
const dedupeVideos = (videos) =>
	Array.from(new Map(videos.map((video) => [video.id, video])).values())

export default function useHomeVideos() {
	const [searchParams, setSearchParams] = useSearchParams()
	const [allVideos, setAllVideos] = useState([])
	const [activeCategory, setActiveCategory] = useState("All")
	const [searchQuery, setSearchQuery] = useState(
		() => searchParams.get("search") || "",
	)
	const [loading, setLoading] = useState(true)
	const [hasMore, setHasMore] = useState(true)
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const [error, setError] = useState("")
	const [visibleVideos, setVisibleVideos] = useState([])

	const refreshVideos = useCallback(() => {
		// The home feed fetches once, then category/search/pagination all happen client-side.
		setLoading(true)
		setError("")

		fetchVideos()
			.then(({ data }) => {
				const fetchedVideos = Array.isArray(data?.videos)
					? data.videos.map(normalizeVideo)
					: []
				const uniqueVideos = dedupeVideos(fetchedVideos)

				setAllVideos(uniqueVideos)
			})
			.catch((fetchError) => {
				console.error("Failed to fetch videos", fetchError)
				setAllVideos([])
				setError("Could not load videos from the API.")
			})
			.finally(() => {
				setLoading(false)
			})
	}, [])

	useEffect(() => {
		refreshVideos()
	}, [refreshVideos])

	useEffect(() => {
		const queryFromUrl = searchParams.get("search") || ""
		setSearchQuery((currentQuery) =>
			currentQuery === queryFromUrl ? currentQuery : queryFromUrl,
		)
	}, [searchParams])

	// Search and category filters compose so both controls can narrow the same feed.
	const filteredVideos = useMemo(
		() => applyFilters(allVideos, activeCategory, searchQuery),
		[allVideos, activeCategory, searchQuery],
	)

	useEffect(() => {
		// Infinite scroll reveals more of the already-filtered list instead of refetching pages.
		setVisibleVideos(filteredVideos.slice(0, visibleCount))
		setHasMore(filteredVideos.length > visibleCount)
	}, [filteredVideos, visibleCount])

	const handleCategoryChange = (category) => {
		if (category === activeCategory) return
		setActiveCategory(category)
		setVisibleCount(PAGE_SIZE)
	}

	const handleSearchChange = (query) => {
		setSearchQuery(query)
		setVisibleCount(PAGE_SIZE)

		// Persist the current search in the URL so header searches can navigate back into Home state.
		const trimmedQuery = query.trim()
		setSearchParams((currentParams) => {
			const nextParams = new URLSearchParams(currentParams)

			if (trimmedQuery) {
				nextParams.set("search", trimmedQuery)
			} else {
				nextParams.delete("search")
			}

			return nextParams
		})
	}

	const handleLoadMore = () => {
		setVisibleCount((previousCount) => previousCount + PAGE_SIZE)
	}

	return {
		videos: visibleVideos,
		loading,
		hasMore,
		error,
		searchQuery,
		handleCategoryChange,
		handleSearchChange,
		handleLoadMore,
	}
}
