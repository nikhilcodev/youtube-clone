import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { FALLBACK_AVATAR } from "../api/videos"
import { AuthContext } from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"
import usePageTitle from "../hooks/usePageTitle"

const formatMemberSince = (date) => {
    if (!date) return "Unknown"

    try {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
        })
    } catch {
        return "Unknown"
    }
}

export default function UserDetails() {
	const { sidebarOpen } = useContext(UIContext)
	const { isAuthenticated, token } = useContext(AuthContext)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const isMountedRef = useRef(true)
	usePageTitle("Your Profile - YouTube")

	useEffect(() => {
		if (!isAuthenticated || !token) return

		isMountedRef.current = true

		// Load the current signed-in user's profile once auth state is available.
		axiosInstance
			.get("/auth/me")
			.then(({ data }) => {
				if (isMountedRef.current) {
					setProfile(data?.user || null)
					setLoading(false)
				}
			})
			.catch((fetchError) => {
				if (isMountedRef.current) {
					console.error("Failed to load profile", fetchError)
					setError(
						fetchError.response?.data?.message ||
							"Could not load your profile right now.",
					)
					setLoading(false)
				}
			})

		return () => {
			isMountedRef.current = false
		}
	}, [isAuthenticated, token])

	const channelsCount = useMemo(
		() => (Array.isArray(profile?.channels) ? profile.channels.length : 0),
		[profile?.channels],
	)

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
					<div className="mx-auto flex w-full max-w-4xl flex-1 items-start justify-center px-3 py-6 xxs:px-4 sm:px-5 sm:py-10">
						{loading ? (
							<div className="w-full max-w-2xl animate-pulse rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] sm:p-8">
								<div className="mx-auto h-24 w-24 rounded-full bg-gray-300 dark:bg-[#272727]" />
								<div className="mt-6 space-y-4">
									<div className="mx-auto h-6 w-40 rounded bg-gray-300 dark:bg-[#272727]" />
									<div className="h-12 rounded-2xl bg-gray-300 dark:bg-[#272727]" />
									<div className="h-12 rounded-2xl bg-gray-300 dark:bg-[#272727]" />
									<div className="h-12 rounded-2xl bg-gray-300 dark:bg-[#272727]" />
								</div>
							</div>
						) : error ? (
							<div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
								{error}
							</div>
						) : profile ? (
							<div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] sm:p-8">
								{/* Top profile block mirrors the public-facing identity users see across the app. */}
								<div className="mt-6 flex flex-col items-center text-center">
									<div className="h-28 w-28 overflow-hidden rounded-full bg-gray-200 ring-4 ring-gray-100 dark:bg-[#272727] dark:ring-[#222]">
										<img
											src={profile.avatar || FALLBACK_AVATAR}
											alt={profile.username}
											onError={(event) => {
												event.currentTarget.src = FALLBACK_AVATAR
											}}
											className="h-full w-full object-cover"
										/>
									</div>
									<h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
										{profile.username}
									</h1>
									<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
										@{profile.username}
									</p>
								</div>

								<div className="mt-8 space-y-4">
									<div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
										<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Name
										</p>
										<p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
											{profile.username}
										</p>
									</div>

									<div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
										<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Handle
										</p>
										<p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
											@{profile.username}
										</p>
									</div>

									<div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
										<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Email
										</p>
										<p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
											{profile.email}
										</p>
									</div>
								</div>

								{/* Summary cards keep the most important account stats scannable on mobile. */}
								<div className="mt-6 grid gap-4 sm:grid-cols-2">
									<div className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-[#202020]">
										<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Channels Created
										</p>
										<p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
											{channelsCount}
										</p>
									</div>
									<div className="rounded-2xl bg-gray-50 px-4 py-4 dark:bg-[#202020]">
										<p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
											Member Since
										</p>
										<p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
											{formatMemberSince(profile.createdAt)}
										</p>
									</div>
								</div>

								<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
									<Link
										to="/my-channels"
										className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#272727]"
									>
										View My Channels
									</Link>
									<Link
										to="/channel/create"
										className="rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700"
									>
										Create Channel
									</Link>
								</div>
							</div>
						) : null}
					</div>
				</main>
			</div>
		</div>
	)
}
