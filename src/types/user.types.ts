export type UserData = {
  uid: string;
  email: string | null;
  username?: string | null;
  role?: "user" | "admin";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};
