import { useState } from "react";
import { FALLBACK_AVATAR } from "../api/videos"

const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now"

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return "Just now"

    return date.toLocaleDateString()
}

export default function CommentCard({
    comment,
    canManage = false,
    onEdit,
    onDelete,
    busy = false,
}) {
    // Keep a local draft so editing can happen inline without mutating the
	// rendered comment text until the user explicitly saves.
	const [isEditing, setIsEditing] = useState(false)
	const [draftText, setDraftText] = useState(comment?.text || "")

	const handleSave = () => {
		const trimmedText = draftText.trim()
		if (!trimmedText) return

		onEdit?.(comment, trimmedText)
		setIsEditing(false)
	}

	return (
		<div className="flex gap-3 px-0 py-3">
			<div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-700">
				<img
					src={comment?.user?.avatar || FALLBACK_AVATAR}
					alt={comment?.user?.username || "User avatar"}
					onError={(event) => {
						event.currentTarget.src = FALLBACK_AVATAR
					}}
					className="h-full w-full object-cover"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						{comment?.user?.username || "Anonymous"}
					</p>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						{formatTimestamp(comment?.timestamp)}
					</span>
				</div>

				{isEditing ? (
					<div className="mt-2 space-y-3">
						<textarea
							id="comment_area"
							value={draftText}
							onChange={(event) => setDraftText(event.target.value)}
							rows={3}
							disabled={busy}
							className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleSave}
								disabled={busy}
								className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
							>
								{busy ? "Saving..." : "Save"}
							</button>
							<button
								type="button"
								onClick={() => {
									// Reset the draft back to the last persisted comment
									// if the user cancels out of edit mode.
									setDraftText(comment?.text || "")
									setIsEditing(false)
								}}
								disabled={busy}
								className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#353535]"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
						{comment?.text}
					</p>
				)}

				{canManage && !isEditing ? (
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							onClick={() => {
								setDraftText(comment?.text || "")
								setIsEditing(true)
							}}
							disabled={busy}
							className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#353535]"
						>
							Edit
						</button>
						<button
							type="button"
							onClick={() => onDelete?.(comment)}
							disabled={busy}
							className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
						>
							Delete
						</button>
					</div>
				) : null}
			</div>
		</div>
	)
}
