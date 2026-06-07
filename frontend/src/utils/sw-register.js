export function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js", {
					type: "module",
				})
				.then((registration) => {
					console.log("[App] Service Worker registered:", registration)

					// Check for updates periodically
					setInterval(() => {
						registration.update()
					}, 60000) // Check every minute
				})
				.catch((error) => {
					console.error("[App] Service Worker registration failed:", error)
				})
		})
	} else {
		console.warn("[App] Service Workers are not supported in this browser")
	}
}

/**
 * Track offline/online status
 */
export function getOnlineStatus() {
	return navigator.onLine
}

export function setOnlineStatusListener(callback) {
	window.addEventListener("online", () => {
		console.log("[App] Online status: connected")
		callback(true)
	})

	window.addEventListener("offline", () => {
		console.log("[App] Online status: disconnected")
		callback(false)
	})
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker() {
	if ("serviceWorker" in navigator) {
		try {
			const registrations = await navigator.serviceWorker.getRegistrations()
			for (let registration of registrations) {
				await registration.unregister()
			}
			console.log("[App] Service Worker unregistered")
		} catch (error) {
			console.error("[App] Failed to unregister Service Worker:", error)
		}
	}
}

/**
 * Check if a new version is available
 */
export function setUpServiceWorkerUpdateListener(onUpdate) {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.addEventListener("controller", () => {
			console.log("[App] Service Worker controller changed")
			if (onUpdate) {
				onUpdate()
			}
		})

		let registration
		navigator.serviceWorker.ready.then((reg) => {
			registration = reg
			return registration.update()
		})

		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({
				type: "SKIP_WAITING",
			})
		}
	}
}
