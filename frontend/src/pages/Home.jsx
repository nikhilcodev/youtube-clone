import { useContext } from "react";
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import FilterBar from "../components/FilterBar"
import VideoGrid from "../components/VideoGrid"
import { UIContext } from "../context/UIContextValue"
import useHomeVideos from "../hooks/useHomeVideos"

export default function Home() {
    const { sidebarOpen } = useContext(UIContext)
    const {
        videos,
        loading,
        hasMore,
        error,
        searchQuery,
        handleCategoryChange,
        handleSearchChange,
		handleLoadMore,
    } = useHomeVideos()

    return (
		<div className="flex h-screen flex-col bg-white dark:bg-[#0f0f0f]">
			{/* Home owns the active search state so the header can filter the feed directly. */}
			<Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />

			<div className="flex flex-1 overflow-hidden">
				<Sidebar />

				{/* The main feed shifts with the sidebar so the grid stays aligned across breakpoints. */}
				<main
					className={`flex min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50 transition-[margin] duration-300 dark:bg-[#121212] ${
						sidebarOpen ? "md:ml-60" : "md:ml-24"
					}`}
				>
					{/* Category filters and the grid both read from the same hook-backed video state. */}
					<FilterBar onCategoryChange={handleCategoryChange} />
					<VideoGrid
						videos={videos}
						isLoading={loading}
						hasMore={hasMore}
						isLoadingMore={false}
						onLoadMore={handleLoadMore}
						error={error}
					/>
				</main>
			</div>
		</div>
	)
}