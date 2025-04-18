"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { useAuthListener } from "@/store/authStore";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuthListener();
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
