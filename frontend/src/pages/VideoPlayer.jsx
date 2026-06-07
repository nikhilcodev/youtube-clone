import { useContext } from "react";
import { BiBookmark, BiDislike, BiLike, BiShare } from "react-icons/bi"
import { Link, useParams } from "react-router-dom"
import { FALLBACK_AVATAR, FALLBACK_THUMBNAIL } from "../api/videos"
import CommentSection from "../components/CommentSection"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { AuthContext } from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"
import usePageTitle from "../hooks/usePageTitle"
import useVideoPlayer from "../hooks/useVideoPlayer"

export default function VideoPlayer() {
    const { id } = useParams()
    const { sidebarOpen } = useContext(UIContext)
    const { user, isAuthenticated } = useContext(AuthContext)
    const {
		video,
		embedUrl,
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
	} = useVideoPlayer({
		id,
		user,
		isAuthenticated,
	})

	usePageTitle(video?.title ? `${video.title} - YouTube` : "YouTube")

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
					{loading ? (
						<div className="mx-auto w-full max-w-[1100px] px-3 py-6 xxs:px-4 sm:px-5">
							<div className="animate-pulse space-y-4">
								<div className="aspect-video rounded-2xl bg-gray-300 dark:bg-[#272727]" />
								<div className="h-8 w-2/3 rounded bg-gray-300 dark:bg-[#272727]" />
								<div className="h-5 w-1/3 rounded bg-gray-300 dark:bg-[#272727]" />
							</div>
						</div>
					) : error ? (
						<div className="mx-auto flex w-full max-w-[1100px] items-center justify-center px-3 py-16 xxs:px-4 sm:px-5">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					) : video ? (
						<div className="mx-auto w-full max-w-[1600px] px-3 py-4 xxs:px-4 sm:px-5">
							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
								{/* Main watch column: player, metadata, and comments. */}
								<div className="min-w-0">
									<div className="overflow-hidden rounded-2xl bg-black shadow-sm">
										<iframe
											title={video.title}
											src={embedUrl}
											className="aspect-video w-full"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
										/>
									</div>

									<div className="mt-3 space-y-3">
										<h1 className="text-xl font-bold leading-8 text-gray-900 dark:text-gray-100 sm:text-2xl">
											{video.title}
										</h1>

										<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											<div className="flex items-center gap-3">
												<div className="h-12 w-12 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
													<img
														src={video.avatar || FALLBACK_AVATAR}
														alt={video.channel}
														className="h-full w-full object-cover"
													/>
												</div>
												<div className="min-w-0">
													<Link
														to={`/channel/${video.channelId}`}
														className="block truncate text-base font-semibold text-gray-900 hover:underline dark:text-gray-100"
													>
														{video.channel}
													</Link>
													<p className="text-sm text-gray-500 dark:text-gray-400">
														{video.views} views •{" "}
														{video.publishedAt
															? new Date(
																	video.publishedAt,
																).toLocaleDateString()
															: "Recently uploaded"}
													</p>
												</div>
												<button
													type="button"
													className="ml-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
												>
													Subscribe
												</button>
											</div>

											<div className="flex flex-wrap gap-3">
												<button
													type="button"
													onClick={() => handleReaction("like")}
													disabled={actionLoading === "like"}
													className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
														liked
															? "bg-blue-600 text-white hover:bg-blue-500"
															: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#333]"
													}`}
												>
													<BiLike size={18} />
													<span>{video.likes}</span>
												</button>
												<button
													type="button"
													onClick={() => handleReaction("dislike")}
													disabled={actionLoading === "dislike"}
													className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
														disliked
															? "bg-red-600 text-white hover:bg-red-500"
															: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#333]"
													}`}
												>
													<BiDislike size={18} />
													<span>{video.dislikes}</span>
												</button>
												<button
													type="button"
													className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#333]"
												>
													<BiShare size={18} />
													<span>Share</span>
												</button>
												<button
													type="button"
													className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#333]"
												>
													<BiBookmark size={18} />
													<span>Save</span>
												</button>
											</div>
										</div>

										<div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-[#181818]">
											<p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
												{video.description || "No description provided."}
											</p>
										</div>
									</div>

									<CommentSection
										comments={comments}
										currentUser={user}
										isAuthenticated={isAuthenticated}
										onAddComment={handleAddComment}
										onEditComment={handleEditComment}
										onDeleteComment={handleDeleteComment}
										error={commentError}
										busy={commentBusyId === "new"}
										busyCommentId={commentBusyId}
									/>
								</div>

								{/* Right rail keeps recommendations visible on wide screens, similar to YouTube's watch page. */}
								<div className="space-y-3 xl:sticky xl:top-20">
									<div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-[#181818]">
										<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Up next
										</h2>
										<div className="mt-3 space-y-3">
											{recommendedVideos.map((item) => (
												<Link
													key={item.id}
													to={`/video/${item.routeId || item.id}`}
													className="group flex gap-3"
												>
													<div className="relative w-40 shrink-0 overflow-hidden rounded-xl bg-gray-300 dark:bg-[#272727]">
														<img
															src={item.thumbnail || FALLBACK_THUMBNAIL}
															alt={item.title}
															onError={(event) => {
																event.currentTarget.src = FALLBACK_THUMBNAIL
															}}
															className="aspect-video h-full w-full object-cover"
														/>
													</div>
													<div className="min-w-0 pt-0.5">
														<h3 className="line-clamp-2 text-[0.92rem] font-medium leading-5 text-gray-900 transition group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
															{item.title}
														</h3>
														<p className="mt-1 text-xs leading-4 text-gray-600 dark:text-gray-400">
															{item.channel}
														</p>
														<p className="text-xs leading-4 text-gray-500 dark:text-gray-400">
															{item.views} views
														</p>
													</div>
												</Link>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					) : null}
				</main>
			</div>
		</div>
	)
}