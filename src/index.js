import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import { DB_NAME } from "./constants.js";
import app from "./app.js";
dotenv.config({ path: "./.env" });

import { MongoClient } from "mongodb";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    /* -> Purpose: Listens for any error events emitted by the app object
      after the database connection is successfully established
      Logs the error to the console
      Re-throws the error to propagate it up the call stack
      -> Scenarios where it executes:
      - Database communication failures - After MongoDB connection succeeds, 
      if the app subsequently loses connection or fails to communicate with the database
      - Unhandled middleware errors - Errors that occur in Express middleware 
      or route handlers that aren't caught elsewhere
      - Critical application errors - Any error event explicitly emitted
       on the app object by other parts of your code
     -> Why it's placed after mongoose.connect(): The comment in your code explains this well 
     - it's a safety net specifically for errors that occur after the database is connected. 
     If you placed this listener before the connection, it would catch connection errors,
     but the pattern here is to handle them separately using the try-catch block
     that wraps the entire IIFE.
     */
    app.on("error", (error) => {
      console.error("Error connecting App to DB", error);
      throw error;
    });

    app.listen(process.env.PORT || 8001, () => {
      console.log(`Server is running on port ${process.env.PORT || 8001}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });

// const app = express();
// const PORT = process.env.PORT || 8001;
// const MONGODB_URI =
//   process.env.MONGODB_URI ||
//   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4w3oms7.mongodb.net/?appName=Cluster0`;
// // `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4w3oms7.mongodb.net`;

// ---------------------------------------------------------------------------------------------

// IIFE is used to connect to DB and start the server as
// one of the approach to separate DB connection logic and not pollute the global space
// but in this way index file will have more code
// Another approach is to create a separate file for DB connection logic in db folders
// (async () => {
//   try {
//     await mongoose.connect(`${MONGODB_URI}/`);

//     // await mongoose.connect(
//     //   // `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4w3oms7.mongodb.net/?appName=Cluster0/youtube_be_project`
//     //   `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4w3oms7.mongodb.net/youtube_be_project`
//     // );

//     // In case DB is connected but app is unable to communicate
//     // can use listerner to catch such errors
//     // listeners are used to listen to certain events
//     app.on("error", (error) => {
//       console.error("Error connecting App to DB", error);
//       throw error;
//     });

//     app.listen(PORT, () => {
//       console.log(`Server is running on port : ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error connecting to the database:", error);
//   }
// })();

// ---------------------------------------------------------------------------------------------

// Using MongoClient from mongodb package to connect to MongoDB
// (async () => {
//   // when using mongoclient it gives tls error for ipv6 so to force it to use ipv4 we can set family:4
//   const client = new MongoClient(MONGODB_URI, { family: 4 });

//   try {
//     await client.connect();
//     // optional ping to confirm connection
//     // await client.db("admin").command({ ping: 1 });
//     console.log("Connected to MongoDB using MongoClient");
//     // const db = client.db(DB_NAME);
//     // const collection = db.collection('documents');
//     // You can perform database operations here using the `db` object
//     app.listen(PORT, () => {
//       console.log(`Server is running on port : ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error connecting to MongoDB using MongoClient", error);
//   }
// })();

// --------------------------------------------------------------------------------------------------------------

// import mongoose from "mongoose";

// const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4w3oms7.mongodb.net/youtube_be_project?retryWrites=true&w=majority&appName=Cluster0`;

// // mongodb url with multiple hosts for replica set in case where facing issue with mongodb+srv urls
// // const MONGO_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-5br5e6z-shard-00-00.4w3oms7.mongodb.net:27017,ac-5br5e6z-shard-00-01.4w3oms7.mongodb.net:27017,ac-5br5e6z-shard-00-02.4w3oms7.mongodb.net:27017/youtube_be_project?tls=true&replicaSet=atlas-96peex-shard-0&authSource=admin`;

// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch((err) => console.error("MongoDB connection error:", err));
