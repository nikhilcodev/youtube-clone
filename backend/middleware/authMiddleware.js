import jwt from "jsonwebtoken"

/**
 * Authentication middleware to verify JWT tokens
 * Attaches user info to req.user if token is valid
 * Returns 401 if token is missing or invalid
 */

const authMiddleware = (req, res, next) => {
    try {
		// Get token from Authorization header (Bearer token)
		const authHeader = req.headers.authorization
		const token =
			authHeader && authHeader.startsWith("Bearer ")
				? authHeader.slice(7)
				: null

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "No token provided. Please log in first.",
			})
		}

		// Verify token using JWT_SECRET from environment
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// Attach user info to request object
		req.user = {
			userId: decoded.userId,
			username: decoded.username,
			email: decoded.email,
		}

		next()
	} catch (error) {
		// Handle different JWT errors
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				message: "Token has expired. Please log in again.",
				expiresAt: error.expiredAt,
			})
		}

		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({
				success: false,
				message: "Invalid token. Please log in again.",
			})
		}

		return res.status(401).json({
			success: false,
			message: "Authentication failed.",
			error: error.message,
		})
	}
}

export default authMiddleware