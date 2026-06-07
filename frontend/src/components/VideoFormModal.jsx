const fieldClasses =
    "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-[#1f1f1f] dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"

export default function VideoFormModal({
	open,
	mode,
	formData,
	formErrors,
	submitError,
	submitting,
	categories,
	onChange,
	onClose,
	onSubmit,
}) {
	// Keep the modal fully out of the tree when it is closed.
	if (!open) return null

	return (
		<div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 px-3 py-6">
			<div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#181818] sm:p-6">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
							{mode === "edit" ? "Edit Video" : "Upload Video"}
						</h2>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{mode === "edit"
								? "Update the video details shown on your channel."
								: "Add a new video to this channel."}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#272727] dark:hover:text-gray-100"
					>
						Close
					</button>
				</div>

				{/* One shared form handles both upload and edit so the field layout stays consistent. */}
				<form onSubmit={onSubmit} className="mt-5 space-y-4">
					<div>
						<label className="text-sm font-medium text-gray-800 dark:text-gray-200">
							Title
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(event) => onChange("title", event.target.value)}
							className={fieldClasses}
							placeholder="Enter a video title"
						/>
						{formErrors.title ? (
							<p className="mt-1 text-xs text-red-600 dark:text-red-400">
								{formErrors.title}
							</p>
						) : null}
					</div>

					<div>
						<label className="text-sm font-medium text-gray-800 dark:text-gray-200">
							Description
						</label>
						<textarea
							id="user_form"
							rows={4}
							value={formData.description}
							onChange={(event) => onChange("description", event.target.value)}
							className={fieldClasses}
							placeholder="Write a short description"
						/>
						{formErrors.description ? (
							<p className="mt-1 text-xs text-red-600 dark:text-red-400">
								{formErrors.description}
							</p>
						) : null}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="text-sm font-medium text-gray-800 dark:text-gray-200">
								Video URL
							</label>
							<input
								type="url"
								value={formData.videoUrl}
								onChange={(event) => onChange("videoUrl", event.target.value)}
								disabled={mode === "edit"}
								className={`${fieldClasses} ${
									mode === "edit" ? "cursor-not-allowed opacity-70" : ""
								}`}
								placeholder="https://www.youtube.com/watch?v=..."
							/>
							{/* The backend treats the source video as immutable after creation, so edit mode only allows metadata changes. */}
							{formErrors.videoUrl ? (
								<p className="mt-1 text-xs text-red-600 dark:text-red-400">
									{formErrors.videoUrl}
								</p>
							) : mode === "edit" ? (
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Video URL stays locked after upload.
								</p>
							) : null}
						</div>

						<div>
							<label className="text-sm font-medium text-gray-800 dark:text-gray-200">
								Thumbnail URL
							</label>
							<input
								type="url"
								value={formData.thumbnailUrl}
								onChange={(event) =>
									onChange("thumbnailUrl", event.target.value)
								}
								className={fieldClasses}
								placeholder="https://example.com/thumbnail.jpg"
							/>
							{formErrors.thumbnailUrl ? (
								<p className="mt-1 text-xs text-red-600 dark:text-red-400">
									{formErrors.thumbnailUrl}
								</p>
							) : null}
						</div>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-800 dark:text-gray-200">
							Category
						</label>
						<select
							value={formData.category}
							onChange={(event) => onChange("category", event.target.value)}
							className={fieldClasses}
						>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
						{formErrors.category ? (
							<p className="mt-1 text-xs text-red-600 dark:text-red-400">
								{formErrors.category}
							</p>
						) : null}
					</div>

					{submitError ? (
						<p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
							{submitError}
						</p>
					) : null}

					{/* Button labels reflect the current mode so users know whether they are creating or updating. */}
					<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-[#272727]"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#121212] dark:hover:bg-gray-200"
						>
							{submitting
								? mode === "edit"
									? "Saving..."
									: "Uploading..."
								: mode === "edit"
									? "Save changes"
									: "Create video"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

