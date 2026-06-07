import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import { AuthContext } from "../context/AuthContextValue"

const INITIAL_FORM = {
    email: "",
    password: "",
}

// Validate locally first so obvious input issues never need an API round-trip.
const validateForm = ({ email, password }) => {
	const errors = {}

	if (!email.trim()) {
		errors.email = "Email is required."
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.email = "Please enter a valid email address."
	}

	if (!password) {
		errors.password = "Password is required."
	}

	return errors
}

export default function Login() {
	const navigate = useNavigate()
	const { login } = useContext(AuthContext)
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
			credentials: "",
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
			const { data } = await axiosInstance.post("/auth/login", {
				email: formData.email.trim(),
				password: formData.password,
			})

			// Successful login updates the shared auth context before returning to the home feed.
			login({
				token: data.token,
				user: data.user,
			})
			navigate("/")
		} catch (error) {
			const responseErrors = error.response?.data?.errors || {}
			const responseMessage =
				error.response?.data?.message || "Login failed. Please try again."

			setErrors({
				email: responseErrors.email || "",
				password: responseErrors.password || "",
				credentials: responseErrors.credentials || "",
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
						Welcome back
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Log in to continue to your YouTube clone.
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit} noValidate>
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
							autoComplete="email"
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
							autoComplete="current-password"
							className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
							placeholder="Enter your password"
						/>
						{errors.password ? (
							<p className="text-sm text-red-600 dark:text-red-400">
								{errors.password}
							</p>
						) : null}
					</div>

					{errors.credentials || apiMessage ? (
						<p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
							{errors.credentials || apiMessage}
						</p>
					) : null}

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
					>
						{submitting ? "Signing in..." : "Log in"}
					</button>
				</form>

				{/* Keep the auth flow connected so first-time users can jump straight to registration. */}
				<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
					Don&apos;t have an account?{" "}
					<Link
						to="/register"
						className="font-medium text-blue-600 hover:underline dark:text-blue-400"
					>
						Register
					</Link>
				</p>
			</div>
		</div>
	)
}
