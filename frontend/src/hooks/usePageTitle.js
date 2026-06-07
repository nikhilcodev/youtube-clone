import { useEffect } from "react";

export default function usePageTitle(title) {
    useEffect(() => {
        if (!title) return

        const previousTitle = document.title
        document.title = title

        return () => {
            document.title = previousTitle
        }
    }, [title])
}