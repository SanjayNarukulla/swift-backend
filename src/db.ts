import { MongoClient, Db } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI as string; // Use environment variable

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing. Check your .env file.");
  process.exit(1); // Exit process to prevent undefined behavior
}

let db: Db;
let client: MongoClient; // Store client instance for cleanup

export async function connectDB() {
  if (db) return db; // Return existing connection

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db("swift-backend-assign"); // Change to your actual database name
    console.log("✅ Connected to MongoDB Atlas");
    return db;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Ensure the app doesn't run in a broken state
  }
}

// Optional: Close the connection when needed
export async function closeDB() {
  if (client) {
    await client.close();
    console.log("🔌 MongoDB connection closed.");
  }
}
