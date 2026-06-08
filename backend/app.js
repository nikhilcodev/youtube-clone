import express from "express"
import dotenv from "dotenv"


dotenv.config()

//import mongoDB connection
import connectDB from "./config/db.js"

// Import routes
import authRoutes from "./routes/authRoutes.js"
import videoRoutes from "./routes/videoRoutes.js"
import channelRoutes from "./routes/channelRoutes.js"


// initialize Express app
const app = express()

// ------DATABASE Connection--------
//connect to MongoDB
connectDB().catch((error) => {
    console.error("Failed to connect to database:", error)
    process.exit(1)
})

// ==================== MIDDLEWARE ====================

// CORS Configuration
const corsOptions = {
	origin: process.env.CLIENT_URL || "http://localhost:5173",
	credentials: true,
	optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Body Parser Middleware - Skip for empty bodies
app.use((req, res, next) => {
	if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
		if (
			!req.headers["content-length"] ||
			parseInt(req.headers["content-length"]) === 0
		) {
			req.body = {}
			return next()
		}
	}
	next()
})

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Request Logging Middleware (optional)
app.use((req, res, next) => {
	const timestamp = new Date().toISOString()
	console.log(`[${timestamp}] ${req.method} ${req.path}`)
	next()
})

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || "development",
	})
})

// ==================== PUBLIC ROUTES ====================

// API Documentation Route
app.get("/api", (req, res) => {
	res.status(200).json({
		success: true,
		message: "YouTube Clone API",
		version: "1.0.0",
		baseUrl: "http://localhost:5000/api",
		endpoints: {
			health: {
				checkHealth: "GET /health",
			},
			auth: {
				register: "POST /api/auth/register",
				login: "POST /api/auth/login",
				getProfile: "GET /api/auth/me (protected)",
			},
			videos: {
				getAllVideos:
					"GET /api/videos (supports ?search=, ?category=, ?page=, ?limit=)",
				getVideoById: "GET /api/videos/:id",
				createVideo: "POST /api/videos (protected)",
				updateVideo: "PUT /api/videos/:id (protected, owner only)",
				deleteVideo: "DELETE /api/videos/:id (protected, owner only)",
				likeVideo: "PUT /api/videos/:id/like (protected)",
				dislikeVideo: "PUT /api/videos/:id/dislike (protected)",
			},
			channels: {
				getAllChannels: "GET /api/channels",
				getChannelById: "GET /api/channels/:id",
				createChannel: "POST /api/channels (protected)",
				updateChannel: "PUT /api/channels/:id (protected, owner only)",
				deleteChannel: "DELETE /api/channels/:id (protected, owner only)",
			},
			comments: {
				getComments: "GET /api/comments/:videoId",
				addComment: "POST /api/comments/:videoId (protected)",
				updateComment: "PUT /api/comments/:commentId (protected, author only)",
				deleteComment:
					"DELETE /api/comments/:commentId (protected, author only)",
			},
		},
		totalEndpoints: 22,
		documentation: "See README.md for detailed documentation",
	})
})

// ==================== AUTH ROUTES ====================

// All auth routes: register, login, me (protected)
app.use("/api/auth", authRoutes)
app.use("/api/videos", videoRoutes)
app.use("/api/channels", channelRoutes)
app.use("/api/comments", commentRoutes)

// ==================== 404 HANDLER ====================

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
		path: req.path,
		method: req.method,
		availableEndpoints: [
			"GET /health",
			"GET /api",
			"POST /api/auth/register",
			"POST /api/auth/login",
			"GET /api/auth/me",
			"GET /api/videos",
			"GET /api/videos/:id",
			"POST /api/videos",
			"PUT /api/videos/:id",
			"DELETE /api/videos/:id",
			"PUT /api/videos/:id/like",
			"PUT /api/videos/:id/dislike",
			"GET /api/channels",
			"GET /api/channels/:id",
			"POST /api/channels",
			"PUT /api/channels/:id",
			"DELETE /api/channels/:id",
			"GET /api/comments/:videoId",
			"POST /api/comments/:videoId",
			"PUT /api/comments/:commentId",
			"DELETE /api/comments/:commentId",
		],
		hint: "Visit GET /api for full documentation",
	})
})

// ==================== ERROR HANDLING MIDDLEWARE ====================

app.use((err, req, res, next) => {
	console.error("Error:", {
		message: err.message,
		stack: err.stack,
		timestamp: new Date().toISOString(),
	})

	const statusCode = err.status || err.statusCode || 500
	const isDevelopment = process.env.NODE_ENV === "development"

	res.status(statusCode).json({
		success: false,
		message: err.message || "Internal server error",
		...(isDevelopment && { stack: err.stack, details: err }),
	})
})

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || "development"

const server = app.listen(PORT, () => {
	console.log("\n" + "=".repeat(60))
	console.log("🚀 EXPRESS SERVER STARTED")
	console.log("=".repeat(60))
	console.log(`📍 Environment: ${NODE_ENV}`)
	console.log(`🌐 Server URL: http://localhost:${PORT}`)
	console.log(`⏰ Started at: ${new Date().toISOString()}`)
	console.log("=".repeat(60))
	console.log("\n📝 API ENDPOINTS:\n")
	console.log("Health Check:")
	console.log("  GET http://localhost:" + PORT + "/health\n")
	console.log("API Documentation:")
	console.log("  GET http://localhost:" + PORT + "/api\n")
	console.log("Authentication:")
	console.log("  POST http://localhost:" + PORT + "/api/auth/register")
	console.log("  POST http://localhost:" + PORT + "/api/auth/login")
	console.log("  GET  http://localhost:" + PORT + "/api/auth/me (protected)\n")
	console.log("Videos:")
	console.log("  GET  http://localhost:" + PORT + "/api/videos")
	console.log("Channels:")
	console.log("  GET  http://localhost:" + PORT + "/api/channels")
	console.log("  GET  http://localhost:" + PORT + "/api/channels/:id\n")
	console.log("=".repeat(60))
	console.log("=".repeat(60) + "\n")
})

// ==================== GRACEFUL SHUTDOWN ====================

process.on("SIGTERM", () => {
	console.log("SIGTERM signal received: closing HTTP server")
	server.close(() => {
		console.log("HTTP server closed")
		process.exit(0)
	})
})

process.on("SIGINT", () => {
	console.log("\nSIGINT signal received: closing HTTP server")
	server.close(() => {
		console.log("HTTP server closed")
		process.exit(0)
	})
})

// ==================== UNHANDLED ERRORS ====================

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason)
	// You can log this to a service like Sentry here
})

process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error)
	process.exit(1)
})
