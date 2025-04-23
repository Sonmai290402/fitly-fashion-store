import HeadingTypo from "@/components/common/HeadingTypo";

import FeaturedReviewCarousel from "./FeaturedReviewCarousel";

const FeaturedReviews = () => {
  return (
    <div className="bg-gradient-to-b from-lime-50 to-white h-screen w-full mx-auto px-2 md:px-5 py-5">
      <HeadingTypo className="text-center">What Our Customers Say?</HeadingTypo>
      <FeaturedReviewCarousel />
    </div>
  );
};

export default FeaturedReviews;
