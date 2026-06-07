import { useContext, useEffect, useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { FALLBACK_AVATAR } from "../api/videos"
import { AuthContext } from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"
import usePageTitle from "../hooks/usePageTitle"

const normalizeChannel = (channel) => ({
	id: channel?._id || channel?.channelId || "",
	routeId: channel?._id || channel?.channelId || "",
	channelName: channel?.channelName || "Untitled Channel",
	description: channel?.description || "No description provided.",
	channelBanner:
		channel?.channelBanner ||
		"https://via.placeholder.com/1280x320?text=Channel+Banner",
	subscribers: Array.isArray(channel?.subscribers)
		? channel.subscribers.length
		: Number(channel?.subscriberCount ?? channel?.subscribers ?? 0),
	videosCount: Array.isArray(channel?.videos) ? channel.videos.length : 0,
	owner: {
		id: channel?.owner?._id || "",
		username: channel?.owner?.username || "Channel Owner",
		avatar: channel?.owner?.avatar || FALLBACK_AVATAR,
	},
})

const formatSubscribers = (count) => {
	if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`
	if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`
	return `${count} subscribers`
}

export default function MyChannels() {
	const { sidebarOpen } = useContext(UIContext)
	const { user, isAuthenticated } = useContext(AuthContext)
	const [channels, setChannels] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	usePageTitle("My Channels - YouTube")

	useEffect(() => {
		if (!isAuthenticated || !user?.id) return

		let isMounted = true

		const fetchChannels = async () => {
			if (isMounted) setLoading(true)
			if (isMounted) setError("")

			try {
				const { data } = await axiosInstance.get("/channels")
				const allChannels = Array.isArray(data?.channels)
					? data.channels.map(normalizeChannel)
					: []

				if (isMounted) {
					// The API returns all channels, so this page narrows them down to the signed-in owner's set.
					setChannels(
						allChannels.filter(
							(channel) => String(channel.owner.id) === String(user.id),
						),
					)
				}
			} catch (fetchError) {
				console.error("Failed to load channels", fetchError)
				if (isMounted) {
					setError(
						fetchError.response?.data?.message ||
							"Could not load your channels right now.",
					)
				}
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		fetchChannels()

		return () => {
			isMounted = false
		}
	}, [isAuthenticated, user?.id])

	const hasChannels = useMemo(() => channels.length > 0, [channels.length])

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return (
		<div className="flex h-screen flex-col bg-white dark:bg-[#0f0f0f]">
			<Header />

			<div className="flex flex-1 overflow-hidden">
				<Sidebar />

				<main
					className={`flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 transition-[margin] duration-300 dark:bg-[#121212] ${
						sidebarOpen ? "md:ml-60" : "md:ml-24"
					}`}
				>
					<div className="mx-auto w-full max-w-400 px-3 py-6 xxs:px-4 sm:px-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
									My Channels
								</h1>
								<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
									Manage and revisit the channels you&apos;ve created.
								</p>
							</div>
							<Link
								to="/channel/create"
								className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
							>
								Create Channel
							</Link>
						</div>

						{loading ? (
							<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
								{[...Array(6)].map((_, index) => (
									<div
										key={index}
										className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#181818]"
									>
										<div className="h-40 bg-gray-300 dark:bg-[#272727]" />
										<div className="space-y-3 p-5">
											<div className="h-6 w-2/3 rounded bg-gray-300 dark:bg-[#272727]" />
											<div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-[#272727]" />
											<div className="h-16 rounded bg-gray-300 dark:bg-[#272727]" />
										</div>
									</div>
								))}
							</div>
						) : error ? (
							<div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
								{error}
							</div>
						) : hasChannels ? (
							/* Each card doubles as navigation back into the full channel page. */
							<div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
								{channels.map((channel) => (
									<Link
										key={channel.id}
										to={`/channel/${channel.routeId}`}
										className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#181818]"
									>
										<div className="relative h-40 overflow-hidden bg-gray-200 dark:bg-[#272727]">
											<img
												src={channel.channelBanner}
												alt={channel.channelName}
												onError={(event) => {
													event.currentTarget.src =
														"https://via.placeholder.com/1280x320?text=Channel+Banner"
												}}
												className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
											/>
										</div>
										<div className="p-5">
											<div className="flex items-start gap-3">
												<div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
													<img
														src={channel.owner.avatar}
														alt={channel.channelName}
														onError={(event) => {
															event.currentTarget.src = FALLBACK_AVATAR
														}}
														className="h-full w-full object-cover"
													/>
												</div>
												<div className="min-w-0">
													<h2 className="truncate text-lg font-semibold text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
														{channel.channelName}
													</h2>
													<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
														@{channel.owner.username}
													</p>
												</div>
											</div>

											<p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
												{channel.description}
											</p>

											<div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-500 dark:text-gray-400">
												<span>{formatSubscribers(channel.subscribers)}</span>
												<span>•</span>
												<span>{channel.videosCount} videos</span>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-[#181818]">
								<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									No channels yet
								</h2>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
									Create your first channel to start building your creator
									space.
								</p>
								<Link
									to="/channel/create"
									className="mt-5 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
								>
									Create Channel
								</Link>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
