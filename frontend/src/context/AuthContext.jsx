import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextValue";

//Decode the JWT payload client side so we can restore auth state
//and ignore expired tokens w/o making an extra request on boot
const decodeToken = (token) => {
	try {
		const payload = token.split(".")[1]
		if (!payload) return null

		const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
		const paddedPayload =
			normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4)
		const decodedPayload = JSON.parse(window.atob(paddedPayload))

		if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
			return null
		}

		return decodedPayload
	} catch {
		return null
	}
}

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => {
		if (typeof window === "undefined") return ""
		const storedToken = window.localStorage.getItem("authToken") || ""
		// Keep only tokens that still decode as valid on initial load.
		return decodeToken(storedToken) ? storedToken : ""
	})
	const [user, setUser] = useState(() => {
		if (typeof window === "undefined") return null

		const storedToken = window.localStorage.getItem("authToken")
		const storedUser = window.localStorage.getItem("currentUser")
		const decodedToken = storedToken ? decodeToken(storedToken) : null

		if (!decodedToken) return null
		if (storedUser) {
			try {
				// Prefer the last user snapshot so the UI has avatar/username immediately.
				return JSON.parse(storedUser)
			} catch {
				// Fall back to the minimal identity data embedded in the token.
				return {
					id: decodedToken.userId || decodedToken.id || "",
					username: decodedToken.username || "",
					email: decodedToken.email || "",
				}
			}
		}

		return {
			id: decodedToken.userId || decodedToken.id || "",
			username: decodedToken.username || "",
			email: decodedToken.email || "",
		}
	})

	const decodedToken = useMemo(
		() => (token ? decodeToken(token) : null),
		[token],
	)
	const isAuthenticated = Boolean(token && user && decodedToken)

	useEffect(() => {
		// This effect only mirrors auth state to localStorage.
		// It intentionally avoids setting React state inside the effect body.
		if (decodedToken) {
			window.localStorage.setItem("authToken", token)
		} else {
			window.localStorage.removeItem("authToken")
		}
	}, [decodedToken, token])

	useEffect(() => {
		// Persist the richer user object separately from the token so
		// the app can restore profile details without another login roundtrip.
		if (user && decodedToken) {
			window.localStorage.setItem("currentUser", JSON.stringify(user))
		} else {
			window.localStorage.removeItem("currentUser")
		}
	}, [decodedToken, user])

	const login = ({ token: nextToken, user: nextUser }) => {
		setToken(nextToken)
		setUser(nextUser)
	}

	const logout = () => {
		setToken("")
		setUser(null)
	}

	const value = useMemo(
		() => ({
			user,
			token,
			login,
			logout,
			isAuthenticated,
		}),
		[isAuthenticated, token, user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
