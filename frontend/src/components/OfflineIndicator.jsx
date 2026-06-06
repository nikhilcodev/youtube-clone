import { useState, useEffect } from "react";
import { getOnlineStatus, setOnlineStatusListener } from "../utils/sw-register"

export default function OfflineIndicator() {
	const [isOnline, setIsOnline] = useState(() => getOnlineStatus())

	useEffect(() => {
		// Listen for online/offline changes
		setOnlineStatusListener((isOnlineStatus) => {
			setIsOnline(isOnlineStatus)
		})
	}, [])

	if (isOnline) {
		return null
	}

	return (
		<div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 shadow-lg z-9999 animate-slideDown md:px-4 md:py-2">
			<div className="flex items-center gap-2 max-w-5xl mx-auto">
				<svg
					className="w-5 h-5 shrink-0 animate-pulse"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<span className="text-sm font-medium md:text-xs">You are offline</span>
			</div>
		</div>
	)
}
