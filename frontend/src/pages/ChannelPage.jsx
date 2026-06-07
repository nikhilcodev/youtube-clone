import { useContext } from "react"
import { HiOutlineMagnifyingGlass } from "react-icons/hi2"
import { useParams } from "react-router-dom"
import ChannelHero from "../components/ChannelHero"
import ChannelVideoCard from "../components/ChannelVideoCard"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import VideoFormModal from "../components/VideoFormModal"
import { AuthContext } from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"
import useChannelPage, {
	CHANNEL_TABS,
	SORT_OPTIONS,
} from "../hooks/useChannelPage"

export default function ChannelPage() {
	const { id } = useParams()
	const { sidebarOpen } = useContext(UIContext)
	const { user, isAuthenticated } = useContext(AuthContext)
	const {
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
	} = useChannelPage({
		channelId: id,
		user,
		isAuthenticated,
	})

	return (
		<div className="flex h-screen flex-col bg-white dark:bg-[#0f0f0f]">
			<Header />

			<div className="flex flex-1 overflow-hidden">
				<Sidebar />

				{/* The channel page shares the same header/sidebar shell as the home feed. */}
				<main
					className={`flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 transition-[margin] duration-300 dark:bg-[#121212] ${
						sidebarOpen ? "md:ml-60" : "md:ml-24"
					}`}
				>
					{loading ? (
						<div className="mx-auto w-full max-w-400 px-3 py-6 xxs:px-4 sm:px-5">
							<div className="animate-pulse space-y-5">
								<div className="h-44 rounded-2xl bg-gray-300 dark:bg-[#272727]" />
								<div className="flex items-center gap-4">
									<div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-[#272727]" />
									<div className="space-y-3">
										<div className="h-7 w-48 rounded bg-gray-300 dark:bg-[#272727]" />
										<div className="h-4 w-32 rounded bg-gray-300 dark:bg-[#272727]" />
									</div>
								</div>
							</div>
						</div>
					) : error ? (
						<div className="mx-auto flex w-full max-w-300 items-center justify-center px-3 py-16 xxs:px-4 sm:px-5">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					) : channel ? (
						<div className="mx-auto w-full max-w-400 px-3 py-5 xxs:px-4 sm:px-5">
							<ChannelHero
								channel={channel}
								isOwner={isOwner}
								onUpload={openCreateModal}
								submitError={submitError}
								modalOpen={modalOpen}
							/>

							{/* Tabs are visual for now; the page currently focuses on the Videos section layout. */}
							<div className="mt-6 border-b border-gray-200 dark:border-gray-800">
								<div className="scrollbar-hide flex items-center gap-5 overflow-x-auto text-sm font-medium text-gray-600 dark:text-gray-400">
									{CHANNEL_TABS.map((tab) => (
										<button
											key={tab}
											type="button"
											className={`border-b-2 px-1 py-3 whitespace-nowrap transition ${
												tab === "Videos"
													? "border-black text-black dark:border-white dark:text-white"
													: "border-transparent hover:text-black dark:hover:text-white"
											}`}
										>
											{tab}
										</button>
									))}
									<button
										type="button"
										className="ml-auto hidden rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white sm:inline-flex"
										aria-label="Search channel"
									>
										<HiOutlineMagnifyingGlass size={18} />
									</button>
								</div>
							</div>

							{/* Sorting happens client-side on the normalized channel video list from the hook. */}
							<div className="mt-4 flex flex-wrap items-center gap-2">
								{SORT_OPTIONS.map((option) => (
									<button
										key={option}
										type="button"
										onClick={() => setSelectedSort(option)}
										className={`rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
											selectedSort === option
												? "bg-black text-white dark:bg-white dark:text-[#121212]"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#272727] dark:text-gray-200 dark:hover:bg-[#333333]"
										}`}
									>
										{option}
									</button>
								))}
							</div>

							<div className="mt-4">
								{sortedVideos.length > 0 ? (
									<div className="grid grid-cols-1 gap-x-4 gap-y-8 pb-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
										{sortedVideos.map((video) => (
											<ChannelVideoCard
												key={video.id}
												video={video}
												canManage={isOwner}
												onEdit={openEditModal}
												onDelete={deleteVideo}
												isDeleting={deletingVideoId === video.id}
											/>
										))}
									</div>
								) : (
									<div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-[#181818]">
										<p className="text-sm text-gray-500 dark:text-gray-400">
											This channel has not uploaded any videos yet.
										</p>
									</div>
								)}
							</div>
						</div>
					) : null}
				</main>
			</div>

			{/* Owners reuse the same modal for both creating new videos and editing existing ones. */}
			<VideoFormModal
				open={modalOpen}
				mode={formMode}
				formData={formData}
				formErrors={formErrors}
				submitError={submitError}
				submitting={submitting}
				categories={categories}
				onChange={updateFormField}
				onClose={closeModal}
				onSubmit={submitVideoForm}
			/>
		</div>
	)
}
