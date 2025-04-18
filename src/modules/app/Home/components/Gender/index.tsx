import HeadingTypo from "@/components/ui/HeadingTypo";

import GenderList from "./GenderList";

const Gender = () => {
  return (
    <section className="text-center py-10">
      <HeadingTypo>Find Your Look</HeadingTypo>
      <GenderList />
    </section>
  );
};

export default Gender;
