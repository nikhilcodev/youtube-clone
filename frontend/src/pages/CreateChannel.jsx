import { useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { AuthContext } from "../context/AuthContextValue"
import { UIContext } from "../context/UIContextValue"
import usePageTitle from "../hooks/usePageTitle"

const INITIAL_FORM = {
    channelName: "",
    description: "",
    channelBanner: "",
}

// Keep validation local so the form can show fast inline feedback before the API round-trip.
const validateForm = ({ channelName, description, channelBanner }) => {
	const errors = {}

	if (!channelName.trim()) {
		errors.channelName = "Channel name is required."
	} else if (channelName.trim().length < 3) {
		errors.channelName = "Channel name must be at least 3 characters."
	}

	if (!description.trim()) {
		errors.description = "Description is required."
	}

	if (channelBanner.trim()) {
		try {
			new URL(channelBanner)
		} catch {
			errors.channelBanner = "Please enter a valid banner URL."
		}
	}

	return errors
}

export default function CreateChannel() {
	const navigate = useNavigate()
	const { sidebarOpen } = useContext(UIContext)
	const { isAuthenticated } = useContext(AuthContext)
	const [formData, setFormData] = useState(INITIAL_FORM)
	const [errors, setErrors] = useState({})
	const [apiMessage, setApiMessage] = useState("")
	const [submitting, setSubmitting] = useState(false)
	usePageTitle("Create Channel - YouTube")

	// Channel creation is only available to signed-in users.
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((current) => ({
			...current,
			[name]: value,
		}))
		setErrors((current) => ({
			...current,
			[name]: "",
		}))
		setApiMessage("")
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		const validationErrors = validateForm(formData)
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors)
			return
		}

		setSubmitting(true)
		setErrors({})
		setApiMessage("")

		try {
			const { data } = await axiosInstance.post("/channels", {
				channelName: formData.channelName.trim(),
				description: formData.description.trim(),
				channelBanner: formData.channelBanner.trim(),
			})

			// The API returns the new channel id, so we can send the user straight to their channel page.
			const nextChannelId = data?.channel?._id || data?.channel?.channelId
			if (nextChannelId) {
				navigate(`/channel/${nextChannelId}`)
				return
			}

			navigate("/")
		} catch (error) {
			const responseErrors = error.response?.data?.errors || {}
			const responseMessage =
				error.response?.data?.message ||
				"Could not create the channel right now."

			setErrors({
				channelName: responseErrors.channelName || "",
				description: responseErrors.description || "",
				channelBanner: responseErrors.channelBanner || "",
			})
			setApiMessage(responseMessage)
		} finally {
			setSubmitting(false)
		}
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
					<div className="mx-auto w-full max-w-3xl px-3 py-6 xxs:px-4 sm:px-5 sm:py-10">
						<div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] sm:p-8">
							<div className="space-y-2">
								<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
									Create Channel
								</h1>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Set up your public channel profile and start uploading videos.
								</p>
							</div>

							<form
								className="mt-6 space-y-5"
								onSubmit={handleSubmit}
								noValidate
							>
								<div className="space-y-1.5">
									<label
										htmlFor="channelName"
										className="text-sm font-medium text-gray-800 dark:text-gray-200"
									>
										Channel Name
									</label>
									<input
										id="channelName"
										name="channelName"
										type="text"
										value={formData.channelName}
										onChange={handleChange}
										className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
										placeholder="Enter your channel name"
									/>
									{errors.channelName ? (
										<p className="text-sm text-red-600 dark:text-red-400">
											{errors.channelName}
										</p>
									) : null}
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="description"
										className="text-sm font-medium text-gray-800 dark:text-gray-200"
									>
										Description
									</label>
									<textarea
										id="description"
										name="description"
										rows={5}
										value={formData.description}
										onChange={handleChange}
										className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
										placeholder="Tell viewers what your channel is about"
									/>
									{errors.description ? (
										<p className="text-sm text-red-600 dark:text-red-400">
											{errors.description}
										</p>
									) : null}
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="channelBanner"
										className="text-sm font-medium text-gray-800 dark:text-gray-200"
									>
										Banner URL
									</label>
									<input
										id="channelBanner"
										name="channelBanner"
										type="url"
										value={formData.channelBanner}
										onChange={handleChange}
										className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
										placeholder="https://example.com/channel-banner.png"
									/>
									{errors.channelBanner ? (
										<p className="text-sm text-red-600 dark:text-red-400">
											{errors.channelBanner}
										</p>
									) : null}
								</div>

								{apiMessage ? (
									<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
										{apiMessage}
									</p>
								) : null}

								<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
									<button
										type="button"
										onClick={() => navigate(-1)}
										className="rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#272727]"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{submitting ? "Creating..." : "Create Channel"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
