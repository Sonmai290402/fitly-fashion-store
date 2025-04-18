import Banner from "./components/Banner";
import Category from "./components/Category";
import Collection from "./components/Collection";
// import FlashSale from "./components/FlashSale";
import Gender from "./components/Gender";
import Highlights from "./components/Highlights";

const HomePage = () => {
  return (
    <>
      <Banner />
      {/* <FlashSale /> */}
      <Gender />
      <Category />
      <Collection />
      <Highlights />
    </>
  );
};

export default HomePage;
