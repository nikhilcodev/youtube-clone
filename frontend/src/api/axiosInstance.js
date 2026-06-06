import axios from "axios"

const axiosInstance = axios.create({
    // Use the env base URL when available, but keep localhost as the dev default.
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
})

axiosInstance.interceptors.request.use((config) => {
	// Attach the JWT automatically so protected routes do not need
	// to set the Authorization header in every request callsite.
	const token =
		typeof window !== "undefined"
			? window.localStorage.getItem("authToken")
			: ""

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

export default axiosInstance