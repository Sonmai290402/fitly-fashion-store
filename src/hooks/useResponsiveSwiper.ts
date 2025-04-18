import { useEffect, useState } from "react";

export const useResponsiveSwiper = (totalSlides: number) => {
  const [visibleSlides, setVisibleSlides] = useState(1);

  const updateVisibleSlides = () => {
    const width = window.innerWidth;

    if (width >= 1024) setVisibleSlides(4);
    else if (width >= 768) setVisibleSlides(3);
    else if (width >= 640) setVisibleSlides(2.5);
    else if (width >= 480) setVisibleSlides(1.5);
    else setVisibleSlides(1.2);
  };

  useEffect(() => {
    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, []);

  const shouldShowControls = totalSlides > visibleSlides;

  return { visibleSlides, shouldShowControls };
};
