"use client";
import { deleteCookie, setCookie } from "cookies-next";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants";
import { auth, fireDB } from "@/firebase/firebaseConfig";
import { LoginCredentials, SignUpCredentials } from "@/types/auth.types";
import { UserData } from "@/types/user.types";
import { handleFirebaseError } from "@/utils/configFirebaseError";

const USER_SPECIFIC_STORAGE_KEYS = Object.values(STORAGE_KEYS);

const AUTH_COOKIE = "auth_token";

type AuthState = {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signup: (credentials: SignUpCredentials) => Promise<boolean>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: UserData | null) => void;
};

const clearAllUserData = () => {
  try {
    deleteCookie(AUTH_COOKIE);

    USER_SPECIFIC_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    window.dispatchEvent(new Event("storage"));

    console.log("All user data cleared successfully");
  } catch (e) {
    console.error("Error clearing user data:", e);
  }
};

const saveUserToStorage = (userData: UserData | null) => {
  if (userData) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userData));
    const authToken = {
      uid: userData.uid,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };
    setCookie("auth_token", btoa(JSON.stringify(authToken)), {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  } else {
    clearAllUserData();
  }
};

const loadUserFromStorage = (): UserData | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!storedUser) return null;
    return JSON.parse(storedUser) as UserData;
  } catch (e) {
    console.error("Error parsing stored user data:", e);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return null;
  }
};

async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDocRef = doc(fireDB, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data?.username && data?.role) {
        return data as UserData;
      } else {
        console.warn(`Firestore data for UID ${uid} is incomplete.`);
      }
    } else {
      console.warn(`User document with UID ${uid} not found.`);
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data in getUserData:", error);
    return null;
  }
}

export async function isUsernameTaken(
  username: string,
  currentUsername?: string
): Promise<boolean> {
  try {
    if (currentUsername && username === currentUsername) {
      return false;
    }
    const q = query(
      collection(fireDB, "users"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking username:", error);
    return true;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== "undefined" ? loadUserFromStorage() : null,
  loading: false,
  error: null,

  setUser: (user) => {
    saveUserToStorage(user);
    set({ user });
  },

  signup: async ({ username, email, password }: SignUpCredentials) => {
    set({ loading: true, error: null });

    try {
      const usernameExists = await isUsernameTaken(username);
      if (usernameExists) {
        toast.error("Username already taken. Please choose another one.");
        set({ loading: false });
        return false;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      const userData: UserData = {
        uid: newUser.uid,
        email: newUser.email,
        username,
        role: "user",
        avatar:
          "https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(fireDB, "users", newUser.uid), userData);

      saveUserToStorage(userData);
      set({ user: userData });

      toast.success("Signup successfully!");
      return true;
    } catch (error) {
      console.error(error);
      handleFirebaseError(error as FirebaseError);
      set({ error: (error as Error).message, loading: false });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async ({ email, password }: LoginCredentials) => {
    set({ loading: true, error: null });
    let loggedInFirebaseUser: User | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      loggedInFirebaseUser = userCredential.user;

      const userData = await getUserData(loggedInFirebaseUser.uid);

      if (userData) {
        saveUserToStorage(userData);
        set({ user: userData, loading: false, error: null });

        toast.success("Login successfully!");
        return true;
      } else {
        await signOut(auth);
        saveUserToStorage(null);
        set({ user: null });
        toast.error("User data is invalid.");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      handleFirebaseError(error as FirebaseError);
      set({
        error: (error as Error).message,
        loading: false,
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);

    saveUserToStorage(null);
    set({ user: null });

    toast.success("Logged out successfully!");
  },
}));

export const useAuthListener = () => {
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        saveUserToStorage(null);
        setUser(null);
        return;
      }

      try {
        const userData = await getUserData(firebaseUser.uid);
        if (!userData) {
          console.warn(`Invalid user data for UID: ${firebaseUser.uid}`);
          saveUserToStorage(null);
          setUser(null);
          await signOut(auth);
          return;
        }

        saveUserToStorage(userData);
        setUser(userData);
      } catch (error) {
        console.error("Auth listener error:", error);
        saveUserToStorage(null);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);
};
