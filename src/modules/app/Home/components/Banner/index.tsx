import BannerBg from "./BannerBg";
import BannerContent from "./BannerContent";

const Banner = () => {
  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[16/7] lg:aspect-[16/6] overflow-hidden">
      <BannerBg />
      <BannerContent />
    </section>
  );
};

export default Banner;
