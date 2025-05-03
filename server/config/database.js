import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default dbConnect;