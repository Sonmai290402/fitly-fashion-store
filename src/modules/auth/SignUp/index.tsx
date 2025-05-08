"use client";

import React, { Suspense } from "react";

import SignUpForm from "./components/SignUpForm";

const SignUp = () => {
  return (
    <div className="bg-auth min-h-screen w-full flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
};

export default SignUp;
