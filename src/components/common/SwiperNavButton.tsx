import clsx from "clsx";
import { MoveLeft, MoveRight } from "lucide-react";
import { useSwiper } from "swiper/react";

interface SwiperNavButtonProps {
  shouldShow?: boolean;
  className?: string;
}

const SwiperNavButton = ({
  shouldShow = true,
  className,
}: SwiperNavButtonProps) => {
  const swiper = useSwiper();

  if (!shouldShow || !swiper) return null;

  return (
    <div
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-50 px-3",
        className
      )}
    >
      <button
        onClick={() => swiper.slidePrev()}
        className="bg-primary/80 text-primary-foreground p-2 rounded-full hover:bg-primary/50 transition-colors duration-300"
        aria-label="Previous slide"
      >
        <MoveLeft className="size-8" />
      </button>
      <button
        onClick={() => swiper.slideNext()}
        className="bg-primary/80 text-primary-foreground p-2 rounded-full hover:bg-primary/50 transition-colors duration-300"
        aria-label="Next slide"
      >
        <MoveRight className="size-8" />
      </button>
    </div>
  );
};

export default SwiperNavButton;
