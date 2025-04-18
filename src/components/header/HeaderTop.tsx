import Link from "next/link";
import React from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

const HeaderTop = () => {
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) return null;
  return (
    <div className="bg-darker text-white text-center dark:bg-white dark:text-black">
      Get early access on launches and offers.{" "}
      <Link href="/signup" className="underline hover:opacity-80">
        Sign Up Now
      </Link>
    </div>
  );
};

export default HeaderTop;
