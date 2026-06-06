import { useEffect, useRef } from "react";
import VideoCard from "./VideoCard";

export default function VideoGrid({
    videos,
    isLoading,
    hasMore,
    isLoadingMore,
    onLoadMore,
    error,
}) {
    const loadMoreRef = useRef(null)
    //keep the feed layout even home, channel, search reults
    const gridClasses =
		"mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-x-4 gap-y-8 px-3 py-4 xxs:px-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 sm:px-5 lg:grid-cols-4 lg:py-6"

    useEffect(() => {
		if (!hasMore || isLoading || isLoadingMore || !onLoadMore) return

		const observerTarget = loadMoreRef.current
		if (!observerTarget) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					onLoadMore()
				}
			},
			{
				// Start loading a little before the user hits the bottom so scrolling feels seamless.
				root: null,
				rootMargin: "200px 0px",
				threshold: 0.1,
			},
		)

		observer.observe(observerTarget)

		return () => observer.disconnect()
	}, [hasMore, isLoading, isLoadingMore, onLoadMore, videos.length])

	if (isLoading) {
		return (
			<div className={gridClasses}>
				{[...Array(12)].map((_, i) => (
					<div key={i} className="animate-pulse">
						<div className="mb-3 aspect-video rounded-2xl bg-gray-300" />
						<div className="space-y-2">
							<div className="h-4 rounded bg-gray-300" />
							<div className="h-3 w-2/3 rounded bg-gray-300" />
						</div>
					</div>
				))}
			</div>
		)
	}

	if (!videos || videos.length === 0) {
		return (
			<div className="flex items-center justify-center h-96">
				<p className="text-gray-500 dark:text-gray-400">
					{error || "No videos found"}
				</p>
			</div>
		)
	}

	return (
		<div className="pb-8">
			<div className={gridClasses}>
				{videos.map((video) => (
					<VideoCard key={video.id} video={video} />
				))}
			</div>

			{hasMore ? (
				// This sentinel is what the intersection observer watches to trigger the next batch.
				<div
					ref={loadMoreRef}
					className="flex justify-center px-3 pt-2 text-sm text-gray-500 dark:text-gray-400 sm:px-5"
				>
					<span>{isLoadingMore ? "Loading..." : "Loading more videos..."}</span>
				</div>
			) : null}
		</div>
	)
}
