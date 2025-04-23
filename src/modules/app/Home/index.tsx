import Banner from "./components/Banner";
import Category from "./components/Category";
import Collection from "./components/Collection";
import FeaturedReviews from "./components/FeaturedReviews";
import Gender from "./components/Gender";
import Highlights from "./components/Highlights";

const HomePage = () => {
  return (
    <>
      <Banner />
      <Gender />
      <Category />
      <Collection />
      <FeaturedReviews />
      <Highlights />
    </>
  );
};

export default HomePage;
