import { useState } from "react";

// The bar can render immediately from a stable local list even if
// category fetching is deferred or unavailable.
const FALLBACK_CATEGORIES = [
	"All",
	"Tech",
	"Gaming",
	"Music",
	"Education",
	"Entertainment",
	"Sports",
	"Other",
]

export default function FilterBar({ onCategoryChange }) {
    const [activeCategory, setActiveCategory] = useState("All")
    const [categories] = useState(FALLBACK_CATEGORIES)

    const handleCategoryClick = (category) => {
        // Avoid retriggering filter work when the already-active chip is clicked.
        if (category === activeCategory) return
        setActiveCategory(category)
        onCategoryChange?.(category)
    }

    return (
		<div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:border-gray-800 dark:bg-[#121212]/95 dark:supports-backdrop-filter:bg-[#121212]/80">
			<div className="mx-auto flex w-full max-w-400 gap-2 overflow-x-auto px-3 py-3 scrollbar-hide xxs:px-4 sm:gap-3 sm:px-5">
				{categories.map((category) => (
					<button
						key={category}
						onClick={() => handleCategoryClick(category)}
						className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
							activeCategory === category
								? "bg-gray-900 text-white dark:bg-white dark:text-[#121212]"
								: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-[#272727] dark:text-gray-100 dark:hover:bg-[#3a3a3a]"
						}`}
					>
						{category}
					</button>
				))}
			</div>
		</div>
	)
}