import { useState } from "react"
import { Link } from "react-router-dom"
import CommentCard from "./CommentCard"

export default function CommentSection({
	comments = [],
	currentUser,
	isAuthenticated = false,
	onAddComment,
	onEditComment,
	onDeleteComment,
	error = "",
	busy = false,
	busyCommentId = "",
}) {
	const [draftComment, setDraftComment] = useState("")

	const handleSubmit = (event) => {
		event.preventDefault()
		const trimmedComment = draftComment.trim()
		if (!trimmedComment) return

		onAddComment?.(trimmedComment)
		setDraftComment("")
	}

	return (
		<section className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{comments.length} Comments
				</h2>
			</div>

			{/* Only signed-in users can post comments, but the list stays visible to everyone. */}
			<div className="mt-5">
				{isAuthenticated ? (
					<form onSubmit={handleSubmit} className="flex gap-3">
						<div className="min-w-0 flex-1">
							<textarea
								id="new_comment"
								value={draftComment}
								onChange={(event) => setDraftComment(event.target.value)}
								rows={3}
								disabled={busy}
								placeholder="Add a comment..."
								className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#222] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
							/>
							<div className="mt-3 flex justify-end">
								<button
									type="submit"
									disabled={busy || !draftComment.trim()}
									className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
								>
									{busy ? "Posting..." : "Comment"}
								</button>
							</div>
						</div>
					</form>
				) : (
					<p className="text-sm text-gray-600 dark:text-gray-400">
						<Link
							to="/login"
							className="font-medium text-blue-600 hover:underline dark:text-blue-400"
						>
							Sign in
						</Link>{" "}
						to join the conversation.
					</p>
				)}
			</div>

			{error ? (
				<p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
					{error}
				</p>
			) : null}

			<div className="mt-6 space-y-1">
				{/* Each comment decides locally whether it is in view or edit mode. */}
				{comments.length > 0 ? (
					comments.map((comment) => (
						<CommentCard
							key={comment.id}
							comment={comment}
							canManage={String(comment?.user?._id) === String(currentUser?.id)}
							onEdit={onEditComment}
							onDelete={onDeleteComment}
							busy={busyCommentId === comment.id}
						/>
					))
				) : (
					<p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:bg-[#181818] dark:text-gray-400">
						No comments yet. Be the first to start the conversation.
					</p>
				)}
			</div>
		</section>
	)
}
