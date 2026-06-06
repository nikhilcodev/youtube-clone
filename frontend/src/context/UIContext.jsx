import { useEffect, useState } from "react";
import { UIContext} from "./UIContextValue"

export function UIProvider({ children }) {
    // Desktop starts with the sidebar open, while mobile and tablet start with the compact experience.
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === 'undefined') return true
        return window.innerWidth >= 768
    })
    // Theme preference is restored from localStorage first, then falls back to the system preference.
	const [darkMode, setDarkMode] = useState(() => {
		if (typeof window === "undefined") return false
		const savedTheme = window.localStorage.getItem("theme")
		if (savedTheme) return savedTheme === "dark"
		return window.matchMedia("(prefers-color-scheme: dark)").matches
	})

	useEffect(() => {
		const handleResize = () => {
			setSidebarOpen(window.innerWidth >= 768)
		}

		// Resize events keep the sidebar mode aligned with the shared md breakpoint.
		window.addEventListener("resize", handleResize)

		return () => window.removeEventListener("resize", handleResize)
	}, [])

	useEffect(() => {
		// Persist the preference; the App shell applies the actual `dark` class.
		window.localStorage.setItem("theme", darkMode ? "dark" : "light")
	}, [darkMode])

	const toggleSidebar = () => setSidebarOpen((prev) => !prev)
	const closeSidebar = () => setSidebarOpen(false)
	const openSidebar = () => setSidebarOpen(true)
	const toggleTheme = () => setDarkMode((prev) => !prev)

	return (
		<UIContext.Provider
			value={{
				sidebarOpen,
				toggleSidebar,
				closeSidebar,
				openSidebar,
				darkMode,
				toggleTheme,
			}}
		>
			{children}
		</UIContext.Provider>
	)
}