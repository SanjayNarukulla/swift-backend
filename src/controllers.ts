import { connectDB } from "./db";
import { IncomingMessage, ServerResponse } from "http";
import { User, Post, Comment } from "./models";

export async function getUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const db = await connectDB();
    const userId = extractUserId(req);
    if (!userId) return sendResponse(res, 400, { error: "Invalid User ID" });

    console.log("Searching for user with ID:", userId);
    const user = await db.collection("users").findOne({ id: userId });
    if (!user) return sendResponse(res, 404, { error: "User not found" });

    const posts = await db
      .collection("posts")
      .find({ userId: user.id })
      .toArray();
    if (posts.length > 0) {
      const postIds = posts.map((post) => post.id);
      const comments = await db
        .collection("comments")
        .find({ postId: { $in: postIds } })
        .toArray();

      posts.forEach((post) => {
        post.comments = comments.filter(
          (comment) => comment.postId === post.id
        );
      });
    }

    sendResponse(res, 200, { ...user, posts });
  } catch (err) {
    handleError(res, err);
  }
}

export async function deleteUser(req: IncomingMessage, res: ServerResponse) {
  try {
    const db = await connectDB();
    const userId = extractUserId(req);
    if (!userId) return sendResponse(res, 400, { error: "Invalid User ID" });

    const result = await db.collection("users").deleteOne({ id: userId });
    if (result.deletedCount === 0)
      return sendResponse(res, 404, { error: "User not found" });

    sendResponse(res, 200, { message: "User deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
}

export async function deleteAllUsers(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const db = await connectDB();
    const result = await db.collection("users").deleteMany({});

    if (result.deletedCount === 0) {
      return sendResponse(res, 404, { message: "No users found to delete" });
    }

    sendResponse(res, 200, { message: "All users deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
}

export async function addUser(req: IncomingMessage, res: ServerResponse) {
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));
  req.on("error", (err) => handleError(res, err));

  req.on("end", async () => {
    try {
      const db = await connectDB();
      const newUser: User = JSON.parse(body);

      const validationError = validateUserData(newUser);
      if (validationError)
        return sendResponse(res, 400, { error: validationError });

      const existingUser = await db
        .collection("users")
        .findOne({ email: newUser.email });
      if (existingUser)
        return sendResponse(res, 409, { error: "User already exists" });

      const userResult = await db.collection("users").insertOne({
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        address: newUser.address,
        phone: newUser.phone,
        website: newUser.website,
        company: newUser.company,
      });

      sendResponse(res, 201, {
        message: "User added successfully",
        user: newUser,
      });
    } catch (err) {
      handleError(res, err);
    }
  });
}

function extractUserId(req: IncomingMessage): number | null {
  try {
    const url = new URL(req.url || "", "http://localhost");
    const userIdStr = url.pathname.split("/")[2];
    const userId = parseInt(userIdStr, 10);
    return isNaN(userId) || userId <= 0 ? null : userId;
  } catch (error) {
    return null;
  }
}

function validateUserData(user: any): string | null {
  if (!user || typeof user !== "object") return "Invalid request body.";
  if (!user.id || typeof user.id !== "number")
    return "User ID is required and must be a number.";
  if (!user.name || typeof user.name !== "string")
    return "User name is required.";
  if (!user.username || typeof user.username !== "string")
    return "Username is required.";
  if (!user.email || !isValidEmail(user.email)) return "Invalid email format.";
  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendResponse(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function handleError(res: ServerResponse, err: unknown) {
  console.error("Error:", err instanceof Error ? err.message : err);
  sendResponse(res, 500, { error: "Internal Server Error" });
}
