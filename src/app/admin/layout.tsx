"use client";

import React from "react";

import { ThemeProvider } from "@/components/common/theme-provider";
import Sidebar from "@/components/layout/sidebar";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthListener } from "@/store/authStore";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  useAuthListener();
  const hasHydrated = useHasHydrated();
  if (!hasHydrated) return null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
    >
      <div className="wrapper grid grid-cols-[300px_minmax(0,1fr)] h-full">
        <Sidebar />
        <div className="p-5">{children}</div>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
