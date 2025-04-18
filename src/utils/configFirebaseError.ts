import toast from "react-hot-toast";

interface FirebaseError {
  code: string;
  message?: string;
}

export const handleFirebaseError = (error: FirebaseError) => {
  let errorMessage = "Something went wrong. Please try again.";

  switch (error.code) {
    case "auth/email-already-in-use":
      errorMessage = "This email is already registered. Try logging in.";
      break;
    case "auth/invalid-email":
      errorMessage = "Invalid email format. Please check again.";
      break;
    case "auth/weak-password":
      errorMessage = "Password is too weak. Use at least 8 characters.";
      break;

    case "auth/user-not-found":
      errorMessage = "No user found with this email. Please sign up first.";
      break;
    case "auth/wrong-password":
      errorMessage = "Incorrect password. Please try again.";
      break;
    case "auth/invalid-credential":
      errorMessage = "Invalid email or password. Please try again.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many failed login attempts. Try again later.";
      break;
    case "auth/user-disabled":
      errorMessage = "This account has been disabled. Contact support.";
      break;

    case "auth/network-request-failed":
      errorMessage = "Network error. Check your internet connection.";
      break;
    case "auth/internal-error":
      errorMessage = "An internal server error occurred. Try again later.";
      break;

    default:
      errorMessage = "An unexpected error occurred. Please try again.";
      break;
  }

  toast.error(errorMessage);
};
