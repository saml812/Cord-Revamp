export interface User {
  id: string;
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