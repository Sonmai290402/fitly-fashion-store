import Banner from "./components/Banner";
import Category from "./components/Category";
import Collection from "./components/Collection";
import FeaturedReviewsCarousel from "./components/FeaturedReviews/FeaturedReviewCarousel";
import Gender from "./components/Gender";
import Highlights from "./components/Highlights";

const HomePage = () => {
  return (
    <>
      <Banner />
      <Gender />
      <Category />
      <Collection />
      <FeaturedReviewsCarousel />
      <Highlights />
    </>
  );
};

export default HomePage;
