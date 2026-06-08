import express from "express"
import jsonwebtoken from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { validateRegistration, validateLogin } from "../utils/validators.js"
import { buildAvatarUrl, normalizeAvatarUrl } from "../utils/helpers.js"

const router = express.Router()

/**
 * POST /api/auth/register
 * Creates a new user with validated input and hashed password
 *
 * Body: { username, email, password }
 * Returns: { success, message, user, token }
 * Errors: 400 (validation), 409 (user exists), 500 (server error)
 */

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body

        // ==================== INPUT VALIDATION ====================
		const validation = validateRegistration({ username, email, password })

		if (!validation.isValid) {
			return res.status(400).json({
				success: false,
				message: "Validation failed. Please check the errors below.",
				errors: validation.errors,
			})
		}

		// ==================== DUPLICATE CHECK ====================
		const existingUser = await User.findOne({
			$or: [
				{ email: email.toLowerCase() },
				{ username: username.toLowerCase() },
			],
		})

		if (existingUser) {
			const duplicateField =
				existingUser.email === email.toLowerCase() ? "email" : "username"
			return res.status(409).json({
				success: false,
				message: `A user with this ${duplicateField} already exists.`,
				errors: {
					[duplicateField]: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} is already in use.`,
				},
			})
		}

		// ==================== PASSWORD HASHING ====================
		const hashedPassword = await bcrypt.hash(password, 10)

		// ==================== USER CREATION ====================
		const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		const newUser = new User({
			userId,
			username: username.trim().toLowerCase(),
			email: email.trim().toLowerCase(),
			password: hashedPassword,
			avatar: buildAvatarUrl(username),
		})

		await newUser.save()

		// ==================== RESPONSE ====================
		res.status(201).json({
			success: true,
			message: "User registered successfully.",
			user: {
				id: newUser._id,
				userId: newUser.userId,
				username: newUser.username,
				email: newUser.email,
				avatar: normalizeAvatarUrl(newUser.avatar, newUser.username),
			},
		})
	} catch (error) {
		console.error("Register error:", error)
		res.status(500).json({
			success: false,
			message: "Registration failed. Please try again later.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * POST /api/auth/login
 * Validates credentials and returns JWT token
 *
 * Body: { email, password }
 * Returns: { success, message, user, token }
 * Errors: 400 (validation), 401 (invalid credentials), 500 (server error)
 */
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body

		// ==================== INPUT VALIDATION ====================
		const validation = validateLogin({ email, password })

		if (!validation.isValid) {
			return res.status(400).json({
				success: false,
				message: "Validation failed. Please check the errors below.",
				errors: validation.errors,
			})
		}

		// ==================== USER LOOKUP ====================
		const user = await User.findOne({ email: email.toLowerCase() })

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password.",
				errors: {
					credentials: "The email or password you provided is incorrect.",
				},
			})
		}

		// ==================== PASSWORD VERIFICATION ====================
		const isPasswordValid = await bcrypt.compare(password, user.password)

		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password.",
				errors: {
					credentials: "The email or password you provided is incorrect.",
				},
			})
		}

		// ==================== TOKEN GENERATION ====================
		const token = jwt.sign(
			{
				userId: user._id,
				username: user.username,
				email: user.email,
			},
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
		)

		// ==================== RESPONSE ====================
		res.status(200).json({
			success: true,
			message: "Login successful.",
			user: {
				id: user._id,
				userId: user.userId,
				username: user.username,
				email: user.email,
				avatar: normalizeAvatarUrl(user.avatar, user.username),
			},
			token,
		})
	} catch (error) {
		console.error("Login error:", error)
		res.status(500).json({
			success: false,
			message: "Login failed. Please try again later.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

/**
 * GET /api/auth/me
 * Returns logged-in user profile (protected route)
 *
 * Headers: Authorization: Bearer <token>
 * Returns: { success, message, user }
 * Errors: 401 (unauthorized), 404 (not found), 500 (server error)
 */
router.get("/me", authMiddleware, async (req, res) => {
	try {
		// ==================== USER LOOKUP ====================
		const user = await User.findById(req.user.userId).select("-password")

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User profile not found. Please log in again.",
			})
		}

		// ==================== RESPONSE ====================
		res.status(200).json({
			success: true,
			message: "User profile retrieved successfully.",
			user: {
				id: user._id,
				userId: user.userId,
				username: user.username,
				email: user.email,
				avatar: normalizeAvatarUrl(user.avatar, user.username),
				channels: user.channels,
				createdAt: user.createdAt,
			},
		})
	} catch (error) {
		console.error("Get user profile error:", error)
		res.status(500).json({
			success: false,
			message: "Failed to retrieve user profile.",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
})

export default router
