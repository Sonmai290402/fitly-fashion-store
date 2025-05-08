"use client";

import React, { Suspense } from "react";

import LoginForm from "./components/LoginForm";

const Login = () => {
  return (
    <div className="bg-auth min-h-screen w-full flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default Login;
