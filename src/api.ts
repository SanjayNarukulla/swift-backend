import { connectDB } from "./db";
import { User, Post, Comment } from "./models";

export async function loadData() {
  try {
    console.log("Connecting to MongoDB...");
    const db = await connectDB();
    console.log("Connected to MongoDB successfully.");

    const usersCollection = db.collection("users");
    const postsCollection = db.collection("posts");
    const commentsCollection = db.collection("comments");

    console.log("Fetching data from JSONPlaceholder...");
    const [usersRes, postsRes, commentsRes] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users").then((res) =>
        res.json()
      ),
      fetch("https://jsonplaceholder.typicode.com/posts").then((res) =>
        res.json()
      ),
      fetch("https://jsonplaceholder.typicode.com/comments").then((res) =>
        res.json()
      ),
    ]);

    const users = usersRes as User[];
    const posts = postsRes as Post[];
    const comments = commentsRes as Comment[];

    console.log(
      `Fetched ${users.length} users, ${posts.length} posts, and ${comments.length} comments.`
    );

    // Clear existing data to prevent duplication
    await Promise.all([
      usersCollection.deleteMany({}),
      postsCollection.deleteMany({}),
      commentsCollection.deleteMany({}),
    ]);
    console.log("Cleared old data.");

    // Insert Users
    console.log("Inserting users...");
    await usersCollection.insertMany(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        address: user.address,
        phone: user.phone,
        website: user.website,
        company: user.company,
      }))
    );
    console.log(`Inserted ${users.length} users.`);

    // Insert Posts
    console.log("Inserting posts...");
    await postsCollection.insertMany(
      posts.map((post) => ({
        id: post.id,
        userId: post.userId,
        title: post.title,
        body: post.body,
      }))
    );
    console.log(`Inserted ${posts.length} posts.`);

    // Insert Comments
    console.log("Inserting comments...");
    await commentsCollection.insertMany(
      comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        name: comment.name,
        email: comment.email,
        body: comment.body,
      }))
    );
    console.log(`Inserted ${comments.length} comments.`);

    return { message: "Data loaded successfully" };
  } catch (error: any) {
    console.error("Error loading data:", error);
    return { error: error.message || "An unknown error occurred" };
  }
}
