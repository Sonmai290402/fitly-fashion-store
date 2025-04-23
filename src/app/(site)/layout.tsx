"use client";

import { ThemeProvider } from "@/components/common/theme-provider";
import FloatingButtonsContainer from "@/components/FloatingButtons/FloatingButtonContainer";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthListener } from "@/store/authStore";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAuthListener();
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
