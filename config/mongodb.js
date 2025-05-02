

// config/mongodb.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/prescripto`);
    console.log("MongoDB connected");
  }
   catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Stop server if DB connection fails
  }
};

export default connectDB;
