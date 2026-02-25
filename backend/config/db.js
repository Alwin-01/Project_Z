import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI || process.env.MONGO_URI);

    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/project_z';
    
    // Try to connect, but don't fail if MongoDB isn't available
    try {
      await mongoose.connect(mongoURI);
      console.log("MongoDB connected");
    } catch (mongoError) {
      console.warn("MongoDB not available, running without database:", mongoError.message);
      console.log("Room data will be stored in memory only");
    }
  } catch (error) {
    console.error("Database setup error:", error.message);
  }
};

export default connectDB;