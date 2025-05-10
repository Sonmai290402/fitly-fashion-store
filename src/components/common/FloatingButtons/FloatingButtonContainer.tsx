"use client";

import CartButton from "./CartButton";
import ScrollToTopButton from "./ScrollToTopButton";

export default function FloatingButtonsContainer() {
  return (
    <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-4 items-center">
      <ScrollToTopButton />
      <CartButton />
    </div>
  );
}
