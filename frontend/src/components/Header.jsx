import { useContext, useEffect, useRef, useState } from "react";
import { HiOutlineBars3 } from "react-icons/hi2"
import { HiOutlineArrowLeft } from "react-icons/hi2"
import { HiOutlineMoon } from "react-icons/hi2"
import { HiOutlineSun } from "react-icons/hi2"
import { IoSearchSharp } from "react-icons/io5"
import { FaYoutube } from "react-icons/fa"
import { Link, useLocation, useNavigate} from "react-router-dom"
import { AuthContext} from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"

export default function Header({ searchQuery = "", onSearchChange }) {
    const navigate = useNavigate()
	const location = useLocation()
	const { toggleSidebar, darkMode, toggleTheme } = useContext(UIContext)
	const { user, logout, isAuthenticated } = useContext(AuthContext)
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
	const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
	const inputRef = useRef(null)

	useEffect(() => {
		setLocalSearchQuery(searchQuery)
	}, [searchQuery])

	useEffect(() => {
		// When the compact mobile search view opens, focus the input immediately
		// so the user can start typing without an extra tap.
		if (mobileSearchOpen) {
			inputRef.current?.focus()
		}
	}, [mobileSearchOpen])

	const activeSearchQuery =
		typeof onSearchChange === "function" ? searchQuery : localSearchQuery

	const handleInputChange = (nextQuery) => {
		if (typeof onSearchChange === "function") {
			onSearchChange(nextQuery)
			return
		}

		setLocalSearchQuery(nextQuery)
	}

	const handleSubmit = (event) => {
		event.preventDefault()
		const trimmedQuery = activeSearchQuery.trim()
		const search = trimmedQuery
			? `?search=${encodeURIComponent(trimmedQuery)}`
			: ""

		if (location.pathname !== "/" || location.search !== search) {
			navigate(`/${search}`)
		}

		setMobileSearchOpen(false)
	}

	const handleLogout = () => {
		logout()
		navigate("/")
	}

	return (
		<header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0f0f0f]">
			<div className="mx-auto flex w-full items-center justify-between gap-2 px-3 py-2 xxs:px-4 sm:gap-4 sm:px-5">
				{/* Left side: sidebar toggle + brand. Hidden while mobile search takes over. */}
				<div
					className={`flex min-w-fit items-center gap-2 xxs:gap-3 ${
						mobileSearchOpen ? "hidden" : "flex"
					} sm:flex`}
				>
					<button
						onClick={toggleSidebar}
						className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
						aria-label="Toggle sidebar"
					>
						<HiOutlineBars3 size={24} className="text-black dark:text-white" />
					</button>
					<Link to="/">
						<div className="flex items-center gap-1.5">
							<FaYoutube size={28} className="text-red-600" />
							<span className="hidden text-lg font-bold text-black dark:text-white xxs:inline">
								YouTube
							</span>
						</div>
					</Link>
				</div>

				{/* Center search collapses into a full-width mobile search mode below `sm`. */}
				<form
					onSubmit={handleSubmit}
					className={`min-w-0 flex-1 justify-center sm:px-4 ${
						mobileSearchOpen ? "flex" : "hidden"
					} sm:flex`}
				>
					<div className="flex w-full items-center gap-2 sm:mx-auto sm:max-w-xl">
						<button
							type="button"
							onClick={() => setMobileSearchOpen(false)}
							className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden"
							aria-label="Close search"
						>
							<HiOutlineArrowLeft
								size={22}
								className="text-black dark:text-white"
							/>
						</button>
						<div className="flex w-full items-center rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-4 pr-2 shadow-sm focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-700 dark:bg-[#1f1f1f] dark:focus-within:border-blue-400 dark:focus-within:bg-[#181818] dark:focus-within:ring-blue-950">
							<input
								id="search-input"
								ref={inputRef}
								type="text"
								placeholder="Search"
								value={activeSearchQuery}
								onChange={(event) => handleInputChange(event.target.value)}
								className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
							/>
							<button
								type="submit"
								className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
								aria-label="Search videos"
							>
								<IoSearchSharp
									size={18}
									className="text-gray-600 dark:text-gray-300"
								/>
							</button>
						</div>
					</div>
				</form>

				{/* Right side: mobile search trigger, theme toggle, and auth/profile actions. */}
				<div
					className={`min-w-fit items-center gap-1 xxs:gap-2 ${
						mobileSearchOpen ? "hidden" : "flex"
					}`}
				>
					<button
						type="button"
						onClick={() => setMobileSearchOpen(true)}
						className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 sm:hidden"
						aria-label="Open search"
					>
						<IoSearchSharp
							size={20}
							className="text-gray-700 dark:text-gray-200"
						/>
					</button>
					<button
						type="button"
						onClick={toggleTheme}
						className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
						aria-label={
							darkMode ? "Switch to light mode" : "Switch to dark mode"
						}
					>
						{darkMode ? (
							<HiOutlineSun size={20} className="text-amber-400" />
						) : (
							<HiOutlineMoon size={20} className="text-gray-700" />
						)}
					</button>
					{isAuthenticated ? (
						<div className="flex items-center gap-2">
							<Link
								to="/profile"
								className="flex items-center gap-2 rounded-full px-1 py-1 transition hover:bg-gray-100 dark:hover:bg-[#272727]"
							>
								<div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
									<img
										src={user?.avatar}
										alt={user?.username}
										className="h-full w-full object-cover"
									/>
								</div>
								<span className="hidden text-sm font-medium text-gray-800 dark:text-gray-200 sm:inline">
									{user?.username}
								</span>
							</Link>
							<button
								type="button"
								onClick={handleLogout}
								className="rounded-full px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 xxs:px-4 sm:px-5"
							>
								Log out
							</button>
						</div>
					) : (
						<Link
							to="/login"
							className="rounded-full px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 xxs:px-4 sm:px-5"
						>
							Sign In
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
