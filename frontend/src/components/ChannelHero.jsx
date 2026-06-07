import { FALLBACK_AVATAR } from "../api/videos"
import ChannelDescription from "./ChannelDescription"

const formatSubscribers = (count) => {
	if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`
	if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`
	return `${count} subscribers`
}

export default function ChannelHero({
	channel,
	isOwner,
	onUpload,
	submitError,
	modalOpen,
}) {
	return (
		<>
			{/* Banner + identity block mirrors the top section of a YouTube channel page. */}
			<div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-[#1c1c1c]">
				<img
					src={channel.channelBanner}
					alt={channel.channelName}
					onError={(event) => {
						event.currentTarget.src =
							"https://via.placeholder.com/1280x320?text=Channel+Banner"
					}}
					className="h-32 w-full object-cover xxs:h-40 sm:h-52 lg:h-60"
				/>
			</div>

			<section className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-4">
					<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-500 text-3xl font-semibold text-white dark:bg-sky-600 sm:h-24 sm:w-24">
						<img
							src={channel.owner.avatar || FALLBACK_AVATAR}
							alt={channel.channelName}
							onError={(event) => {
								event.currentTarget.src = FALLBACK_AVATAR
							}}
							className="h-full w-full object-cover"
						/>
					</div>
					<div className="min-w-0">
						<h1 className="truncate text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
							{channel.channelName}
						</h1>
						<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
							<span>@{channel.owner.username}</span>
							<span>•</span>
							<span>{formatSubscribers(channel.subscribers)}</span>
							<span>•</span>
							<span>{channel.videos.length} videos</span>
						</div>
						<ChannelDescription
							key={channel.id}
							channelId={channel.id}
							description={channel.description}
						/>
						{submitError && !modalOpen ? (
							<p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
								{submitError}
							</p>
						) : null}
					</div>
				</div>

				{/* Owners get the management entry point, while all visitors keep the subscribe CTA. */}
				<div className="flex shrink-0 items-center gap-3">
					{isOwner ? (
						<button
							type="button"
							onClick={onUpload}
							className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
						>
							Upload Video
						</button>
					) : null}
					<button
						type="button"
						className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
					>
						Subscribe
					</button>
				</div>
			</section>
		</>
	)
}
