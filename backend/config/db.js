import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const mongoUri = 
            process.env.MONGO_URI || "mongodb://localhost:27017/youtube-clone"
        
        await mongoose.connect(mongoUri)

        console.log("MongoDB Connected 🚀")
    } catch (error) {
        console.error("MongoDB Connection Error 📛", error)
        process.exit(1)
    }
}

export default connectDB