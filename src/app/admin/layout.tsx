"use client";

import React from "react";

import Sidebar from "@/components/sidebar";
import { useAuthListener } from "@/store/authStore";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  useAuthListener();
  return (
    <div className="wrapper !bg-white grid grid-cols-[300px_minmax(0,1fr)] h-full">
      <Sidebar />
      <div className="p-5">{children}</div>
    </div>
  );
};

export default AdminLayout;
