"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

const HeaderTop = () => {
  const hasHydrated = useHasHydrated();
  const pathname = usePathname();

  const signupUrl =
    pathname && pathname !== "/login" && pathname !== "/signup"
      ? `/signup?return_to=${encodeURIComponent(pathname)}`
      : "/signup";

  if (!hasHydrated) return null;
  return (
    <div className="bg-darker text-white text-center dark:bg-white dark:text-black">
      Get early access on launches and offers.{" "}
      <Link href={signupUrl} className="underline hover:opacity-80">
        Sign Up Now
      </Link>
    </div>
  );
};

export default HeaderTop;
