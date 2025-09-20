export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export interface MessageData {
  text?: string;
  image?: string;
}