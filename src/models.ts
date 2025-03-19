import { ObjectId } from "mongodb";

export interface Geo {
  lat: number; // Changed from string to number
  lng: number; // Changed from string to number
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

/**
 * Represents a comment on a post.
 * Stored in the "comments" collection.
 */
export interface Comment {
  _id?: ObjectId; // MongoDB ObjectId (optional)
  id?: number; // Optional API ID (if using MongoDB-generated _id)
  postId: ObjectId | string; // Foreign key reference to a post (ObjectId instead of number)
  name: string;
  email: string;
  body: string;
}

/**
 * Represents a blog post.
 * Stored in the "posts" collection.
 */
export interface Post {
  _id?: ObjectId; // MongoDB ObjectId (optional)
  id?: number; // Optional API ID (if using MongoDB-generated _id)
  userId: ObjectId; // Foreign key reference to a user (ObjectId instead of number)
  title: string;
  body: string;
  comments?: Comment[]; // Added comments array for relationship
}

/**
 * Represents a user.
 * Stored in the "users" collection.
 */
export interface User {
  _id?: ObjectId; // MongoDB ObjectId (optional)
  id?: number; // Optional API ID (if using MongoDB-generated _id)
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
  posts?: Post[]; // Added posts array for relationship
}
