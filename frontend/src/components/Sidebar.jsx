import { useContext, useState } from "react";
import { HiOutlineHome } from "react-icons/hi2"
import { HiChevronDown } from "react-icons/hi2"
import { HiChevronUp } from "react-icons/hi2"
import { MdOutlineSubscriptions } from "react-icons/md"
import { MdOutlineVideoLibrary } from "react-icons/md"
import { MdOutlineHistory } from "react-icons/md"
import { MdOutlinePlayCircle } from "react-icons/md"
import { MdOutlineTrendingUp } from "react-icons/md"
import { MdOutlineLibraryMusic } from "react-icons/md"
import { MdOutlineSportsBasketball } from "react-icons/md"
import { MdOutlineMovieCreation } from "react-icons/md"
import { MdOutlineArticle } from "react-icons/md"
import { MdOutlineRadio } from "react-icons/md"
import { MdOutlineSettings } from "react-icons/md"
import { MdOutlineAccountCircle } from "react-icons/md"
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2"
import { MdOutlineFeedback } from "react-icons/md"
import { UIContext } from "../context/UIContextValue"

const mainItems = [
	{ name: "Home", icon: HiOutlineHome, href: "/" },
	{
		name: "Subscriptions",
		icon: MdOutlineSubscriptions,
		href: "",
	},
	{ name: "Library", icon: MdOutlineVideoLibrary, href: "/my-channels" },
	{ name: "History", icon: MdOutlineHistory, href: "" },
]

const extraMainItems = [
	{ name: "Your videos", icon: MdOutlineVideoLibrary, href: "" },
	{ name: "Watch later", icon: MdOutlineHistory, href: "" },
]

const exploreItems = [
	{ name: "Trending", icon: MdOutlineTrendingUp, href: "" },
	{ name: "Music", icon: MdOutlineLibraryMusic, href: "" },
	{ name: "Sports", icon: MdOutlineSportsBasketball, href: "" },
	{ name: "Gaming", icon: MdOutlineMovieCreation, href: "" },
	{ name: "News", icon: MdOutlineArticle, href: "" },
	{ name: "Live", icon: MdOutlineRadio, href: "" },
]

const moreItems = [
	{ name: "YouTube Studio", href: "" },
	{ name: "YouTube Music", href: "" },
	{ name: "YouTube Kids", href: "" },
]

const bottomItems = [
	{ name: "Settings", icon: MdOutlineSettings, href: "/settings" },
	{ name: "Help", icon: HiOutlineQuestionMarkCircle, href: "" },
	{ name: "Send feedback", icon: MdOutlineFeedback, href: "" },
]

const collapsedItems = [
	{ name: "Home", icon: HiOutlineHome, href: "/home" },
	{ name: "Shorts", icon: MdOutlinePlayCircle, href: "" },
	{
		name: "Channels",
		icon: MdOutlineSubscriptions,
		href: "/my-channels",
	},
	{ name: "You", icon: MdOutlineAccountCircle, href: "/profile" },
]

export default function Sidebar() {
	const { sidebarOpen, closeSidebar } = useContext(UIContext)
	const [showMore, setShowMore] = useState(false)
	const sectionLinkClasses =
		"flex items-center gap-5 rounded-xl px-3 py-2.5 text-sm font-normal text-gray-900 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-[#272727]"
	const collapsedLinkClasses =
		"flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] leading-4 text-gray-900 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-[#272727]"

	return (
		<>
			{/* Mobile overlay closes the drawer when users tap outside the sidebar. */}
			<div
				onClick={closeSidebar}
				className={`fixed inset-0 top-14.25 z-30 bg-black/30 transition-opacity duration-300 dark:bg-black/50 md:hidden ${
					sidebarOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0"
				}`}
			/>
			<aside
				className={`fixed left-0 top-14.25 z-40 h-[calc(100vh-57px)] overflow-y-auto border-r border-gray-200 bg-white transition-[width,transform] duration-300 dark:border-gray-800 dark:bg-[#0f0f0f] ${
					sidebarOpen
						? "w-60 translate-x-0"
						: "w-0 -translate-x-full md:w-24 md:translate-x-0"
				}`}
			>
				{/* Expanded drawer on mobile and desktop-open state. */}
				{sidebarOpen ? (
					<>
						<nav className="flex flex-col gap-1 p-3">
							{mainItems.map((item) => {
								const Icon = item.icon
								return (
									<a
										key={item.name}
										href={item.href}
										className={sectionLinkClasses}
									>
										<Icon size={22} />
										<span>{item.name}</span>
									</a>
								)
							})}
							{showMore &&
								extraMainItems.map((item) => {
									const Icon = item.icon
									return (
										<a
											key={item.name}
											href={item.href}
											className={sectionLinkClasses}
										>
											<Icon size={22} />
											<span>{item.name}</span>
										</a>
									)
								})}
							<button
								type="button"
								onClick={() => setShowMore((prev) => !prev)}
								className={sectionLinkClasses}
							>
								{showMore ? (
									<HiChevronUp size={22} />
								) : (
									<HiChevronDown size={22} />
								)}
								<span>{showMore ? "Show less" : "Show more"}</span>
							</button>
						</nav>

						<hr className="my-2 border-gray-200 dark:border-gray-800" />

						<div>
							<p className="px-6 py-2 text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
								EXPLORE
							</p>
							<nav className="flex flex-col gap-1 p-3 pt-1">
								{exploreItems.map((item) => {
									const Icon = item.icon
									return (
										<a
											key={item.name}
											href={item.href}
											className={sectionLinkClasses}
										>
											<Icon size={22} />
											<span>{item.name}</span>
										</a>
									)
								})}
							</nav>
						</div>

						<hr className="my-2 border-gray-200 dark:border-gray-800" />

						<div>
							<p className="px-6 py-2 text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
								MORE FROM YOUTUBE
							</p>
							<nav className="flex flex-col gap-1 p-3 pt-1">
								{moreItems.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className="rounded-xl px-3 py-2.5 text-sm font-normal text-gray-900 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-[#272727]"
									>
										{item.name}
									</a>
								))}
							</nav>
						</div>

						<hr className="my-2 border-gray-200 dark:border-gray-800" />

						<nav className="flex flex-col gap-1 p-3">
							{bottomItems.map((item) => {
								const Icon = item.icon
								return (
									<a
										key={item.name}
										href={item.href}
										className={sectionLinkClasses}
									>
										<Icon size={22} />
										<span>{item.name}</span>
									</a>
								)
							})}
						</nav>

						<hr className="my-2 border-gray-200 dark:border-gray-800" />

						<div className="space-y-2 px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
							<p className="font-light leading-relaxed text-gray-500 dark:text-gray-400">
								About Press Copyright
							</p>
							<p className="font-light leading-relaxed text-gray-500 dark:text-gray-400">
								Contact us Creators
							</p>
							<p className="font-light leading-relaxed text-gray-500 dark:text-gray-400">
								Advertise Developers Terms
							</p>
							<p className="font-light leading-relaxed text-gray-500 dark:text-gray-400">
								Privacy Policy & Safety How YouTube works
							</p>
							<p className="font-light leading-relaxed text-gray-500 dark:text-gray-400">
								Test new features
							</p>
							<p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
								© 2026 Akash Damle
							</p>
						</div>
					</>
				) : (
					/* Collapsed rail stays visible from md and up so primary navigation remains accessible. */
					<nav className="hidden h-full flex-col gap-2 px-2 py-4 md:flex">
						{collapsedItems.map((item) => {
							const Icon = item.icon
							return (
								<a
									key={item.name}
									href={item.href}
									className={collapsedLinkClasses}
								>
									<Icon size={24} />
									<span>{item.name}</span>
								</a>
							)
						})}
					</nav>
				)}
			</aside>
		</>
	)
}
