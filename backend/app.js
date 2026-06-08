import express from "express"
import dotenv from "dotenv"


dotenv.config()

//import mongoDB connection
import connectDB from "./config/db.js"


// initialize Express app
const app = express()

// ------DATABASE Connection--------
//connect to MongoDB
connectDB().catch((error) => {
    console.error("Failed to connect to database:", error)
    process.exit(1)
})
