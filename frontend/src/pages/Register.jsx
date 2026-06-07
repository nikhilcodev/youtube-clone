import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"

const INITIAL_FORM = {
	username: "",
	email: "",
	password: "",
}

// Mirror the backend rules here so users get immediate inline feedback while typing.
const validateForm = ({ username, email, password }) => {
	const errors = {}

	if (!username.trim()) {
		errors.username = "Username is required."
	} else if (username.trim().length < 3) {
		errors.username = "Username must be at least 3 characters long."
	}

	if (!email.trim()) {
		errors.email = "Email is required."
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = "Please enter a valid email address."
	}

	if (!password) {
		errors.password = "Password is required."
	} else if (password.length < 6) {
		errors.password = "Password must be at least 6 characters long."
	}

	return errors
}

export default function Register() {
	const navigate = useNavigate()
	const [formData, setFormData] = useState(INITIAL_FORM)
	const [errors, setErrors] = useState({})
	const [submitting, setSubmitting] = useState(false)
	const [apiMessage, setApiMessage] = useState("")

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
		setErrors((prev) => ({
			...prev,
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
		setApiMessage("")
		setErrors({})

		try {
			await axiosInstance.post("/auth/register", {
				username: formData.username.trim(),
				email: formData.email.trim(),
				password: formData.password,
			})
			// Registration hands off to the login page so auth always starts from one flow.
			navigate("/login")
		} catch (error) {
			const responseErrors = error.response?.data?.errors || {}
			const responseMessage =
				error.response?.data?.message || "Registration failed. Please try again."

			setErrors({
				username: responseErrors.username || "",
				email: responseErrors.email || "",
				password: responseErrors.password || "",
			})
			setApiMessage(responseMessage)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-[#121212]">
			<div className="mx-auto w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#181818] sm:p-8">
				<div className="mb-6 space-y-2 text-center">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						Create your account
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Sign up to continue to your YouTube clone.
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit} noValidate>
					<div className="space-y-1.5">
						<label
							htmlFor="username"
							className="text-sm font-medium text-gray-800 dark:text-gray-200"
						>
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							value={formData.username}
							onChange={handleChange}
							className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
							placeholder="Enter your username"
						/>
						{errors.username ? (
							<p className="text-sm text-red-600 dark:text-red-400">
								{errors.username}
							</p>
						) : null}
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="email"
							className="text-sm font-medium text-gray-800 dark:text-gray-200"
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
							placeholder="Enter your email"
						/>
						{errors.email ? (
							<p className="text-sm text-red-600 dark:text-red-400">
								{errors.email}
							</p>
						) : null}
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="password"
							className="text-sm font-medium text-gray-800 dark:text-gray-200"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
							placeholder="Create a password"
						/>
						{errors.password ? (
							<p className="text-sm text-red-600 dark:text-red-400">
								{errors.password}
							</p>
						) : null}
					</div>

					{apiMessage ? (
						<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
							{apiMessage}
						</p>
					) : null}

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
					>
						{submitting ? "Creating account..." : "Register"}
					</button>
				</form>

				{/* Returning users can switch straight into the login page from here. */}
				<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-blue-600 hover:underline dark:text-blue-400"
					>
						Log in
					</Link>
				</p>
			</div>
		</div>
	)
}
