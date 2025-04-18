"use client";

// import { Loader } from "lucide-react";
// import { useRouter } from "next/navigation";
import React from "react";

// import { useHasHydrated } from "@/hooks/useHasHydrated";
// import { useAuthStore } from "@/store/authStore";
import LoginForm from "./components/LoginForm";

const Login = () => {
  // const hasHydrated = useHasHydrated();
  // const { user, loading } = useAuthStore();
  // const router = useRouter();

  // useEffect(() => {
  //   if (hasHydrated && !loading && user) {
  //     router.push("/");
  //   }
  // }, [loading, user, router, hasHydrated]);

  // if (!hasHydrated || loading || user) {
  //   return (
  //     <div className="bg-auth min-h-screen w-full flex items-center justify-center">
  //       <div className="animate-spin text-white">
  //         <Loader className="size-6" />
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="bg-auth min-h-screen w-full flex items-center justify-center">
      <LoginForm />
    </div>
  );
};

export default Login;
