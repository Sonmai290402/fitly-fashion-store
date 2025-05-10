"use client";

import FloatingButtonsContainer from "@/components/common/FloatingButtons/FloatingButtonContainer";
import { ThemeProvider } from "@/components/common/theme-provider";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthListener } from "@/store/authStore";
import { useCartUserSync } from "@/store/cartStore";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuthListener();
  useCartUserSync();
  const hydrated = useHasHydrated();
  if (!hydrated) return null;
  return (
    <div className="flex flex-col min-h-screen">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header />
        {children}
        <Footer />
        <FloatingButtonsContainer />
      </ThemeProvider>
    </div>
  );
}
