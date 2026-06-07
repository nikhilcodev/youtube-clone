import { useState, useMemo } from "react";

const DESCRIPTION_PREVIEW_LENGTH = 180

const renderDescriptionWithLinks = (text) => {
	// Split plain-text descriptions into lines and clickable URL fragments
	// without switching the field over to unsafe HTML rendering.
	const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
	const isUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i
	const lines = text.split("\n")

	return lines.map((line, lineIndex) => {
		const parts = line.split(urlPattern)

		return (
			<span key={`line-${lineIndex}`} className="block">
				{parts.map((part, partIndex) => {
					if (!part) return null

					if (isUrl.test(part)) {
						const href = part.startsWith("http") ? part : `https://${part}`

						return (
							<a
								key={`part-${lineIndex}-${partIndex}`}
								href={href}
								target="_blank"
								rel="noreferrer"
								className="break-all text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								{part}
							</a>
						)
					}

					return <span key={`part-${lineIndex}-${partIndex}`}>{part}</span>
				})}
			</span>
		)
	})
}

export default function ChannelDescription({ description }) {
	const [showFullDescription, setShowFullDescription] = useState(false)

	const fullDescription = description || ""
	// Collapse long descriptions by character count or by too many line breaks,
	// similar to the "Read more" behavior on YouTube-style pages.
	const shouldClampDescription =
		fullDescription.length > DESCRIPTION_PREVIEW_LENGTH ||
		fullDescription.split("\n").length > 3

	const visibleDescription = useMemo(() => {
		if (!shouldClampDescription || showFullDescription) return fullDescription
		return `${fullDescription.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`
	}, [fullDescription, shouldClampDescription, showFullDescription])

	return (
		<div className="mt-3 max-w-3xl">
			<div className="text-sm leading-6 text-gray-700 whitespace-pre-wrap dark:text-gray-300">
				{renderDescriptionWithLinks(visibleDescription)}
			</div>
			{shouldClampDescription ? (
				<button
					type="button"
					onClick={() => setShowFullDescription((current) => !current)}
					className="mt-2 text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
				>
					{showFullDescription ? "Read less" : "Read more"}
				</button>
			) : null}
		</div>
	)
}
