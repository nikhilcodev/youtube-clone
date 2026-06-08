// ==================== HELPERS ====================
const svgToDataUri = (svg) =>
	`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

const escapeXml = (value = "") =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;")

const getInitials = (name = "Avatar") =>
	name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() || "")
		.join("") || "A"

export function buildAvatarUrl(name = "Avatar") {
	const initials = escapeXml(getInitials(name))
	return svgToDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
			<rect width="160" height="160" fill="#0f766e" />
			<circle cx="80" cy="80" r="56" fill="#134e4a" />
			<text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle"
				font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#f8fafc">
				${initials}
			</text>
		</svg>
	`)
}

export function buildChannelBannerUrl(label = "Channel Banner") {
	const safeLabel = escapeXml(label)
	return svgToDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320">
			<defs>
				<linearGradient id="bannerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#0f172a" />
					<stop offset="50%" stop-color="#1d4ed8" />
					<stop offset="100%" stop-color="#0f766e" />
				</linearGradient>
			</defs>
			<rect width="1280" height="320" fill="url(#bannerGradient)" />
			<circle cx="1080" cy="80" r="140" fill="rgba(255,255,255,0.08)" />
			<circle cx="180" cy="260" r="110" fill="rgba(255,255,255,0.08)" />
			<text x="80" y="175" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#f8fafc">
				${safeLabel}
			</text>
		</svg>
	`)
}

export function normalizeAvatarUrl(avatar, name = "Avatar") {
	if (!avatar || avatar.includes("via.placeholder.com")) {
		return buildAvatarUrl(name)
	}

	return avatar
}

export function normalizeChannelBannerUrl(
	channelBanner,
	label = "Channel Banner",
) {
	if (!channelBanner || channelBanner.includes("via.placeholder.com")) {
		return buildChannelBannerUrl(label)
	}

	return channelBanner
}

export function getYouTubeVideoId(url) {
	if (!url || typeof url !== "string") return null
	const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
	const match = url.match(regex)
	return match ? match[1] : null
}

export function getThumbnailUrl(videoUrl) {
	const videoId = getYouTubeVideoId(videoUrl)
	if (!videoId) return null

	return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function normalizeThumbnailUrl(thumbnailUrl, videoUrl) {
	const safeThumbnailUrl = getThumbnailUrl(videoUrl)

	if (!thumbnailUrl || thumbnailUrl.includes("maxresdefault.jpg")) {
		return safeThumbnailUrl
	}

	return thumbnailUrl.includes("img.youtube.com/vi/")
		? thumbnailUrl.replace("https://img.youtube.com/vi/", "https://i.ytimg.com/vi/")
		: thumbnailUrl
}
