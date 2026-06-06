import { Link } from "react-router-dom";
import { FALLBACK_AVATAR, FALLBACK_THUMBNAIL } from "../api/videos";

export default function VideoCard({ video }) {
    const formatViews = (views) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + "M"
		if (views >= 1000) return (views / 1000).toFixed(1) + "K"
        return views
    }

    const publishedLabel = video.publishedAt
        ? new Date(video.publishedAt).toLocaleDateString()
        : "recently uploaded"

    return (
		/* The whole card acts as the click target so browsing the feed feels natural. */
		<Link to={`/video/${video.routeId || video.id}`} className="group block cursor-pointer">
			<div className="relative mb-3 aspect-video overflow-hidden rounded-2xl bg-gray-300 transition duration-300 group-hover:rounded-xl dark:bg-[#272727]">
				<img
					src={video.thumbnail || FALLBACK_THUMBNAIL}
					alt={video.title}
					// Broken remote thumbnails fall back to a stable placeholder instead of collapsing the card.
					onError={(event) => {
						event.currentTarget.src = FALLBACK_THUMBNAIL
					}}
					className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
				/>
				<span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
					12:34
				</span>
			</div>

			<div className="flex gap-3">
				<div className="mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-400 sm:h-10 sm:w-10">
					<img
						src={video.avatar || FALLBACK_AVATAR}
						alt={video.channel}
						// Avatar fallbacks keep the channel row visually consistent even with bad API data.
						onError={(event) => {
							event.currentTarget.src = FALLBACK_AVATAR
						}}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 transition group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300 sm:text-[0.95rem]">
						{video.title}
					</h3>
					<p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
						{video.channel}
					</p>
					<p className="text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
						{formatViews(video.views || 0)} views • {publishedLabel}
					</p>
				</div>
			</div>
		</Link>
	)
}