import clsx from "clsx";
import { useEffect, useState } from "react";
import { useSwiper } from "swiper/react";

interface SwiperPaginationProps {
  totalSlides?: number;
  shouldShow?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  className?: string;
}

const SwiperPagination = ({
  totalSlides,
  shouldShow = true,
  activeColor = "bg-primary",
  inactiveColor = "bg-gray-300",
  className,
}: SwiperPaginationProps) => {
  const swiper = useSwiper();
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(totalSlides || 0);

  useEffect(() => {
    if (!swiper) return;

    const handleSlideChange = () => {
      setActiveIndex(swiper.realIndex);
    };

    if (!totalSlides) {
      const actualSlideCount = swiper.params.loop
        ? swiper.slides.length - (swiper.loopedSlides ?? 0) * 2
        : swiper.slides.length;

      setSlidesCount(actualSlideCount);
    } else {
      setSlidesCount(totalSlides);
    }

    setActiveIndex(swiper.realIndex);
    swiper.on("slideChange", handleSlideChange);
    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [swiper, totalSlides]);

  const handleDotClick = (index: number) => {
    if (!swiper) return;

    if (swiper.params.loop) {
      swiper.slideToLoop(index);
    } else {
      const slideIndex =
        Number(swiper.params.slidesPerView ?? 1) > 1
          ? Math.min(
              index,
              swiper.slides.length - Number(swiper.params.slidesPerView ?? 1)
            )
          : index;

      swiper.slideTo(slideIndex);
    }
  };

  if (!shouldShow || !slidesCount || slidesCount <= 1) return null;

  return (
    <div
      className={clsx("flex justify-center items-center gap-2 mt-5", className)}
    >
      {Array.from({ length: slidesCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleDotClick(index)}
          className={clsx(
            "transition-all duration-300 rounded-full focus:outline-none",
            "size-2",
            activeIndex === index ? activeColor : inactiveColor,
            activeIndex === index ? "scale-110" : "hover:scale-110"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SwiperPagination;
