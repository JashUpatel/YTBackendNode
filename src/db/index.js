import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
      // unknown connectoon string will study later
      // "mongodb+srv://${process.env.DB_USER}:jzoCmwFIuOBEyQk2@cluster0.qtcpb1c.mongodb.net/?appName=Cluster0"
    );
    console.log("MongoDB connected successfully");
    console.log(
      `MongoDB Connected to database: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection Error", error);
    // node gives access to process object globally
    // process is the reference to current running application
    // process.exit will exit the application
    process.exit(1);
  }
};

export default connectDB;
