import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2"
import { Link } from "react-router-dom"
import { FALLBACK_AVATAR, FALLBACK_THUMBNAIL } from "../api/videos"

const formatViews = (views) => {
	if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
	if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
	return views
}

export default function ChannelVideoCard({
	video,
	canManage = false,
	onEdit,
	onDelete,
	isDeleting = false,
}) {
	const publishedLabel = video.publishedAt
		? new Date(video.publishedAt).toLocaleDateString()
		: "Recently uploaded"

	return (
		<div className="group">
			<div className="relative mb-3">
				{/* The thumbnail remains the main navigation target to the watch page. */}
				<Link
					to={`/video/${video.routeId || video.id}`}
					className="block overflow-hidden rounded-2xl bg-gray-300 dark:bg-[#272727]"
				>
					<div className="aspect-video overflow-hidden">
						<img
							src={video.thumbnail || FALLBACK_THUMBNAIL}
							alt={video.title}
							onError={(event) => {
								event.currentTarget.src = FALLBACK_THUMBNAIL
							}}
							className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
						/>
					</div>
				</Link>

				{canManage ? (
					/* Owner controls live on top of the thumbnail so creators can
					   edit/delete without leaving the channel management view. */
					<div className="absolute right-3 top-3 flex items-center gap-2">
						<button
							type="button"
							onClick={() => onEdit?.(video)}
							className="rounded-full bg-black/80 p-2 text-white transition hover:bg-black dark:bg-[#0f0f0f]/80"
							aria-label={`Edit ${video.title}`}
						>
							<HiOutlinePencilSquare size={16} />
						</button>
						<button
							type="button"
							onClick={() => onDelete?.(video)}
							disabled={isDeleting}
							className="rounded-full bg-black/80 p-2 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0f0f0f]/80"
							aria-label={`Delete ${video.title}`}
						>
							<HiOutlineTrash size={16} />
						</button>
					</div>
				) : null}
			</div>

			<div className="flex gap-3">
				<div className="mt-1 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700 sm:h-10 sm:w-10">
					<img
						src={video.avatar || FALLBACK_AVATAR}
						alt={video.channel}
						onError={(event) => {
							event.currentTarget.src = FALLBACK_AVATAR
						}}
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="min-w-0 flex-1">
					<Link
						to={`/video/${video.routeId || video.id}`}
						className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 transition hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300 sm:text-[0.95rem]"
					>
						{video.title}
					</Link>
					<p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
						{video.channel}
					</p>
					<p className="text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
						{formatViews(video.views || 0)} views • {publishedLabel}
					</p>
				</div>
			</div>
		</div>
	)
}
